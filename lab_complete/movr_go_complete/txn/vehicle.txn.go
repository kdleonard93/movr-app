package txn

import (
	"context"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v4"

	//Import local package models using Go modules
	"github.com/crdb/movrapp/models"
)

// GetVehicleTx gets a single vehicle object.
//
// Arguments:
//         ctx {context.Context} -- The context that allows for cancellation signals across API boundaries.
//         tx {pgx.Tx} -- represents a database transaction.
//         id {uuid.UUID} -- Vehicle identifier.
//
// Returns:
//         {models.Vehicle} -- Vehicle object
//
func GetVehicleTx(ctx context.Context, tx pgx.Tx, id uuid.UUID) (*models.Vehicle, error) {
	row := tx.QueryRow(ctx,
		`SELECT
                        id,
                        in_use,
                        battery,
                        vehicle_info,
			serial_number
                FROM
                        vehicles
                WHERE id = $1`, id)

	var vehicle models.Vehicle
	if err := row.Scan(
		&vehicle.ID,
		&vehicle.InUse,
		&vehicle.Battery,
		&vehicle.VehicleInfo,
		&vehicle.SerialNumber); err != nil {
		return nil, err
	}

	return &vehicle, nil
}

// GetVehiclesTx selects all rows from the vehicles table, limited by the max number of records
// passed into the function.
//
// Arguments:
//         ctx {context.Context} -- The context that allows for cancellation signals across API boundaries.
//         tx {pgx.Tx} -- represents a database transaction.
//         maxVehicles {int} -- Limits the number of records returned.
//
// Returns:
//         {[]models.VehicleWithLocation} -- A slice of VehicleWithLocation records containing vehicle information.
//
func GetVehiclesTx(ctx context.Context, tx pgx.Tx, maxVehicles int) ([]models.VehicleWithLocation, error) {
	var vehicles []models.VehicleWithLocation = []models.VehicleWithLocation{}
	rows, err := tx.Query(context.Background(),
		`SELECT
                        v.id AS id,
                        v.in_use AS in_use,
                        v.vehicle_info AS vehicle_info,
                        v.battery AS battery,
                        l.ts AS last_checkin,
                        l.latitude AS last_latitude,
                        l.longitude AS last_longitude
                FROM
                        vehicles AS v
                INNER JOIN
                        location_history AS l
                                ON v.id = l.vehicle_id
                INNER JOIN
                        (
                                SELECT
                                        vehicle_id,
                                        MAX(ts) AS max_ts
                                FROM
                                        location_history
                                GROUP BY
                                        vehicle_id
                        ) AS g
                                ON g.vehicle_id = l.vehicle_id
                                AND g.Max_TS = l.ts
                ORDER BY l.ts desc
                LIMIT $1;`, maxVehicles)

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var vehicle models.VehicleWithLocation
		if err = rows.Scan(
			&vehicle.VehicleID,
			&vehicle.InUse,
			&vehicle.VehicleInfo,
			&vehicle.Battery,
			&vehicle.LastCheckin,
			&vehicle.LastLatitude,
			&vehicle.LastLongitude); err != nil {
			return nil, err
		}

		vehicles = append(vehicles, vehicle)
	}

	return vehicles, nil
}

// GetVehicleAndLocationHistoryTx selects all location history rows from the location_history table,
// limited by the max number of records passed into the function as well as the vehicle information
// for the specified identifier.
//
// Arguments:
//         ctx {context.Context} -- The context that allows for cancellation signals across API boundaries.
//         tx {pgx.Tx} -- represents a database transaction.
//         id {uuid.UUID} -- Vehicle identifier
//         maxLocations {int} -- Limits the number of location history records returned.
//
// Returns:
//         vehicle {models.Vehicle} -- the vehicle information for the provided identifier
//         locationHistory {[]models.LocationHistory} -- A slice of LocationHistory records for the specified vehicle.
//
func GetVehicleAndLocationHistoryTx(ctx context.Context, tx pgx.Tx, id uuid.UUID, maxLocations int) (*models.Vehicle, []models.LocationHistory, error) {
	var locationHistory []models.LocationHistory = []models.LocationHistory{}
	row := tx.QueryRow(context.Background(),
		`SELECT
                        v.id AS id,
                        v.in_use AS in_use,
                        v.vehicle_info AS vehicle_info,
                        v.battery AS battery,
			v.serial_number AS serial_number
                FROM
                        vehicles AS v
                WHERE v.id = $1`, id)

	var vehicle models.Vehicle
	if err := row.Scan(
		&vehicle.ID,
		&vehicle.InUse,
		&vehicle.VehicleInfo,
		&vehicle.Battery,
		&vehicle.SerialNumber); err != nil {
		return nil, nil, err
	}

	rows, err := tx.Query(context.Background(),
		`SELECT
                        id,
                        vehicle_id,
                        ts,
                        longitude,
                        latitude
                FROM
                        location_history
                WHERE vehicle_id = $1
                ORDER BY ts DESC
                LIMIT $2`, id, maxLocations)
	defer rows.Close()

	if err != nil {
		return nil, nil, err
	}

	for rows.Next() {
		var lh models.LocationHistory
		if err = rows.Scan(
			&lh.ID,
			&lh.VehicleID,
			&lh.Timestamp,
			&lh.Longitude,
			&lh.Latitude); err != nil {
			return nil, nil, err
		}

		locationHistory = append(locationHistory, lh)
	}

	return &vehicle, locationHistory, nil
}

// AddVehicleTx adds a new row to the Vehicle table.
//
// Arguments:
//         ctx {context.Context} -- The context that allows for cancellation signals across API boundaries.
//         tx {pgx.Tx} -- represents a database transaction.
//         vehicleLoc {models.AddVehicleAndLocation} -- variadic parameters passed in to AddVehicleTx.
//
// Returns:
//	   vehicleID {uuid.UUID} -- Vehicle primary key
//	   locationID {uuid.UUID} -- Location primary key
//
func AddVehicleTx(ctx context.Context, tx pgx.Tx, vehicleLoc models.AddVehicleAndLocation) (vehicleID uuid.UUID, locationID uuid.UUID, err error) {
	err = tx.QueryRow(ctx,
		`INSERT INTO 
			vehicles (id, in_use, battery, vehicle_info)
		VALUES 
			($1, $2, $3, $4) 
		RETURNING id`, uuid.New(), false, vehicleLoc.Battery, vehicleLoc.VehicleInfoByte).Scan(&vehicleID)

	if err != nil {
		return
	}

	err = tx.QueryRow(ctx,
		`INSERT INTO
			location_history (id, vehicle_id, ts, latitude, longitude)
		VALUES
			($1, $2, $3, $4, $5)
		RETURNING id`, uuid.New(), vehicleID, time.Now(), vehicleLoc.Latitude, vehicleLoc.Longitude).Scan(&locationID)

	return
}

// DeleteVehicleTx removes a row from the vehicles table.
//
// Arguments:
//         ctx {Context} -- The context that allows for cancellation signals across API boundaries.
//         tx {Tx} -- represents a database transaction.
//         id {uuid.UUID} -- Vehicle identifier.
//
func DeleteVehicleTx(ctx context.Context, tx pgx.Tx, id uuid.UUID) error {
	_, err := tx.Exec(ctx,
		`DELETE
		FROM 
			vehicles
                WHERE 
			id = $1
		AND
			in_use = 'f'`, id)

	return err
}
