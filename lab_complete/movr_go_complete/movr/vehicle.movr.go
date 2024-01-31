package movr

import (
	"context"

	"github.com/cockroachdb/cockroach-go/v2/crdb/crdbpgx"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v4"

	// Use go modules to import models & txn local packages
	"github.com/crdb/movrapp/models"
	"github.com/crdb/movrapp/txn"
)

// Get Vehicle returns a vehicle object identified by id from the database.
func GetVehicle(id uuid.UUID) (*models.Vehicle, error) {
	var vehicle *models.Vehicle
	conn := GetConnection()
	ctx := context.Background()
	defer conn.Close(ctx)

	err := crdbpgx.ExecuteTx(ctx, crdbpgx.Conn(conn), pgx.TxOptions{}, func(tx pgx.Tx) error {
		var err error
		vehicle, err = txn.GetVehicleTx(ctx, tx, id)
		return err
	})

	return vehicle, err
}

// Get Vehicles returns a list of vehicle objects from the database.
func GetVehicles(maxVehicles int) ([]models.VehicleWithLocation, error) {
	var vehicles []models.VehicleWithLocation
	conn := GetConnection()
	defer conn.Close(context.Background())

	err := crdbpgx.ExecuteTx(context.Background(), crdbpgx.Conn(conn), pgx.TxOptions{}, func(tx pgx.Tx) error {
		var err error
		vehicles, err = txn.GetVehiclesTx(context.Background(), tx, maxVehicles)
		return err
	})

	return vehicles, err
}

// Get Vehicle And Location History returns a single vehicle by its id along with its location history.
func GetVehicleAndLocationHistory(id uuid.UUID, maxLocations int) (vehicle *models.Vehicle, locationHistory []models.LocationHistory, err error) {
	conn := GetConnection()
	ctx := context.Background()
	defer conn.Close(ctx)

	err = crdbpgx.ExecuteTx(ctx, crdbpgx.Conn(conn), pgx.TxOptions{}, func(tx pgx.Tx) error {
		var err error
		vehicle, locationHistory, err = txn.GetVehicleAndLocationHistoryTx(context.Background(), tx, id, maxLocations)
		return err
	})

	return vehicle, locationHistory, err
}

// Add Vehicle adds a new vehicle object into the database.
func AddVehicle(vehicle models.AddVehicleAndLocation) (vehicleID uuid.UUID, locationID uuid.UUID, err error) {
	conn := GetConnection()
	ctx := context.Background()
	defer conn.Close(ctx)

	err = crdbpgx.ExecuteTx(ctx, crdbpgx.Conn(conn), pgx.TxOptions{}, func(tx pgx.Tx) error {
		vehicleID, locationID, err = txn.AddVehicleTx(ctx, tx, vehicle)
		return err
	})

	return
}

// DeleteVehicle removes a vehicle from the database identified by its id.
func DeleteVehicle(id uuid.UUID) error {
	conn := GetConnection()
	ctx := context.Background()
	defer conn.Close(ctx)

	err := crdbpgx.ExecuteTx(ctx, crdbpgx.Conn(conn), pgx.TxOptions{}, func(tx pgx.Tx) error {
		var err error
		err = txn.DeleteVehicleTx(ctx, tx, id)
		return err
	})

	return err
}
