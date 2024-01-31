package movr

import (
	"context"
	"time"

	"github.com/cockroachdb/cockroach-go/v2/crdb/crdbpgx"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v4"

	// Use go modules to import models & txn local packages
	"github.com/crdb/movrapp/models"
	"github.com/crdb/movrapp/txn"
)

// StartRide returns a ride by  from the database.
func StartRide(vehicleID uuid.UUID, userEmail string) (ride *models.Ride, err error) {
	conn := GetConnection()
	ctx := context.Background()
	defer conn.Close(ctx)

	err = crdbpgx.ExecuteTx(ctx, crdbpgx.Conn(conn), pgx.TxOptions{}, func(tx pgx.Tx) error {
		var err error
		ride, err = txn.StartRideTx(ctx, tx, vehicleID, userEmail)
		return err
	})

	return
}

// StartRide returns a ride by  from the database.
func GetActiveRide(vehicleID uuid.UUID, userEmail string) (ride *models.VehicleWithLocation, rideID uuid.UUID, err error) {
	conn := GetConnection()
	ctx := context.Background()
	defer conn.Close(ctx)

	err = crdbpgx.ExecuteTx(ctx, crdbpgx.Conn(conn), pgx.TxOptions{}, func(tx pgx.Tx) error {
		var err error
		ride, rideID, err = txn.GetActiveRideTx(ctx, tx, vehicleID, userEmail)
		return err
	})

	return
}

// EndRide updates the ride and vehicle tables.
func EndRide(rideID uuid.UUID, newLatitude float64, newLongitude float64, newBattery int, endTime time.Time) (err error) {
	conn := GetConnection()
	ctx := context.Background()
	defer conn.Close(ctx)

	err = crdbpgx.ExecuteTx(ctx, crdbpgx.Conn(conn), pgx.TxOptions{}, func(tx pgx.Tx) error {
		var err error
		err = txn.EndRideTx(ctx, tx, rideID, newLatitude, newLongitude, newBattery, endTime)
		return err
	})

	return
}

// GetRidesByUser selects all rides taken by a given user.
func GetRidesByUser(userEmail string) (userRides []models.UserRide, err error) {
	conn := GetConnection()
	ctx := context.Background()
	defer conn.Close(ctx)

	err = crdbpgx.ExecuteTx(ctx, crdbpgx.Conn(conn), pgx.TxOptions{}, func(tx pgx.Tx) error {
		var err error
		userRides, err = txn.GetRidesByUserTx(ctx, tx, userEmail)
		return err
	})

	return
}
