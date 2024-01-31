package txn

import (
	"context"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v4"

	//Import local package models using Go modules
	"github.com/crdb/movrapp/models"
)

// StartRideTx adds a new row to the Ride table.
//
// Arguments:
//         ctx {Context} -- The context that allows for cancellation signals across API boundaries.
//         tx {Tx} -- represents a database transaction.
//         arg {...interface{}} -- variadic parameters passed in to AddRideTx.
//
// Returns:
//	   {Ride} -- Entity describing the Movr ride.
//
func StartRideTx(ctx context.Context, tx pgx.Tx, vehicleID uuid.UUID, userEmail string) (*models.Ride, error) {
	var lastLatitude, lastLongitude float32
	err := tx.QueryRow(ctx,
		`SELECT 
			latitude AS last_latitude,
			longitude AS last_longitude
		FROM
			location_history
		WHERE
			vehicle_id = $1
		ORDER BY
			ts DESC`, vehicleID).Scan(&lastLatitude, &lastLongitude)
	if err != nil {
		return nil, err
	}

	// Initialize time here to synchronize time within rides and location_history. UTC time is preferred to standardize time system-wide.
	now := time.Now().UTC()

	_, err = tx.Exec(ctx,
		`INSERT INTO 
			location_history (id, vehicle_id, ts, latitude, longitude)
		VALUES
			($1, $2, $3, $4, $5)`, uuid.New(), vehicleID, now, lastLatitude, lastLongitude)
	if err != nil {
		return nil, err
	}

	ride := &models.Ride{
		ID:        uuid.New(),
		VehicleID: vehicleID,
		UserEmail: userEmail,
		StartTS:   now,
	}

	_, err = tx.Exec(ctx,
		`INSERT INTO 
			rides (id, vehicle_id, user_email, start_ts)
		VALUES 
			($1, $2, $3, $4)`, ride.ID, ride.VehicleID, userEmail, ride.StartTS)
	if err != nil {
		return nil, err
	}

	_, err = tx.Exec(ctx,
		`UPDATE
			vehicles
		SET
			in_use = 't'
		WHERE
			id = $1`, vehicleID)

	return ride, err
}

// GetRideTx gets a single ride object.
//
// Arguments:
//         ctx {Context} -- The context that allows for cancellation signals across API boundaries.
//         tx {Tx} -- represents a database transaction.
//
// Returns:
//         {VehicleWithLocation} -- Data model returning vehicle ride status at ride start.
//
func GetActiveRideTx(ctx context.Context, tx pgx.Tx, vehicleID uuid.UUID, userEmail string) (*models.VehicleWithLocation, uuid.UUID, error) {
	var ride models.VehicleWithLocation
	var rideID uuid.UUID

	if err := tx.QueryRow(ctx,
		`SELECT
			rides.id AS ride_id,
			v.id AS id,
			v.in_use AS in_use,
			v.battery AS battery,
			v.vehicle_info AS vehicle_info,
			lh.ts AS ts,
			lh.latitude AS latitude,
			lh.longitude AS longitude
                FROM
			rides
		INNER JOIN
			vehicles v
		ON 
			rides.vehicle_id = v.id
		INNER JOIN
			location_history lh
		ON 
			lh.vehicle_id = v.id
                WHERE
			rides.vehicle_id = $1
		AND
			rides.user_email = $2
		AND
			rides.end_ts IS NULL
		AND
			v.in_use = 't'
		AND
			lh.ts = rides.start_ts
		ORDER BY 
			lh.ts DESC`, vehicleID, userEmail).Scan(
		&rideID,
		&ride.VehicleID,
		&ride.InUse,
		&ride.Battery,
		&ride.VehicleInfo,
		&ride.LastCheckin,
		&ride.LastLatitude,
		&ride.LastLongitude); err != nil {
		return nil, rideID, err
	}

	return &ride, rideID, nil
}

//
// EndRideTx ends the ride.
//
// Arguments:
//         ctx {Context} -- The context that allows for cancellation signals across API boundaries.
//         tx {Tx} -- represents a database transaction.
//	   rideID {uuid.UUID} -- UUID for the ride.
//	   newLatitude {float32} -- New latitude given by the form submission.
//	   newLongitude {float32} -- New longitude given by the form submission.
//	   endTime {time.Time} -- The time given that the ride ended.
//
// Returns:
//         {error}
//
func EndRideTx(ctx context.Context, tx pgx.Tx, rideID uuid.UUID, newLatitude float64, newLongitude float64, newBattery int, endTime time.Time) error {
	var vehicleID uuid.UUID
	err := tx.QueryRow(ctx,
		`UPDATE 
			rides
		SET
			end_ts = $1
		WHERE
			id = $2
		RETURNING
			vehicle_id`, endTime, rideID).Scan(&vehicleID)
	if err != nil {
		return err
	}

	_, err = tx.Exec(ctx,
		`INSERT INTO
                        location_history (id, vehicle_id, ts, latitude, longitude)
                VALUES
                        ($1, $2, $3, $4, $5)`, uuid.New(), vehicleID, endTime, newLatitude, newLongitude)
	if err != nil {
		return err
	}

	_, err = tx.Exec(ctx,
		`UPDATE
			vehicles
		SET
			in_use = 'f',
			battery = $1
		WHERE
			id = $2
		AND
			in_use = 't'`, newBattery, vehicleID)

	return err
}

//
// GetRidesByUserTx selects all rides taken by a particular user.
//
// Arguments:
//         ctx {Context} -- The context that allows for cancellation signals across API boundaries.
//         tx {Tx} -- represents a database transaction.
//	   userEmail {string} -- Foreign key to filter results on select.
//
// Returns:
//        {[]models.Rides} -- A slice of rides records for the specified user.
//
func GetRidesByUserTx(ctx context.Context, tx pgx.Tx, userEmail string) (userRides []models.UserRide, err error) {
	userRides = make([]models.UserRide, 0)
	rows, err := tx.Query(context.Background(),
		`SELECT
			r.vehicle_id AS vehicle_id,
			v.vehicle_info AS vehicle_info,
			r.start_ts AS start_ts,
			r.end_ts AS end_ts,
			v.in_use AS in_use
                FROM
                        rides r
		INNER JOIN
			vehicles v
		ON
			v.id = r.vehicle_id
                WHERE 
			r.user_email = $1
                ORDER BY 
			r.start_ts DESC`, userEmail)
	if err != nil {
		return nil, err
	}

	defer rows.Close()

	for rows.Next() {
		var ur models.UserRide
		if err = rows.Scan(
			&ur.VehicleID,
			&ur.VehicleInfo,
			&ur.StartTs,
			&ur.EndTs,
			&ur.InUse); err != nil {
			return nil, err
		}

		userRides = append(userRides, ur)
	}

	return
}
