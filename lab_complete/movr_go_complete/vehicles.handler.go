package main

import (
	"fmt"
	"net/http"
	"strconv"

	"github.com/google/uuid"
	"github.com/gorilla/mux"
	"github.com/jackc/pgx"

	// Import local package movr using Go modules
	"github.com/crdb/movrapp/movr"
)

//
// Vehicles Endpoints
//
//  vehicles.handler.go contains four Movr API Endpoints:
//    GetVehicles, GetVehiclesAndLocationHistory,
//    GetVehicleAndLocationHistory & DeleteVehicle
//
// See responses.go & helpers.go
//

// GetAll Vehicles API Endpoint
func GetVehicles(w http.ResponseWriter, r *http.Request) {
	maxRecords, err := strconv.Atoi(r.FormValue("max_vehicles"))
	if err != nil {
		maxRecords = MaxRecords
	}

	vehicles, err := movr.GetVehicles(maxRecords)
	if err != nil {
		InternalServerError(w, fmt.Sprintf("Error getting data: %v", err))
		return
	}

	StatusOK(w, vehicles)

}

// GetVehicle by ID With Location History API Endpoint
func GetVehicleAndLocationHistory(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := uuid.Parse(vars["vehicle-id"])
	if err != nil {
		BadRequest(w, fmt.Sprintf("Error parsing id: %v", err))
		return
	}

	vehicle, locationHistory, err := movr.GetVehicleAndLocationHistory(id, MaxRecords)
	if err != nil {
		InternalServerError(w, fmt.Sprintf("Error getting data: %v", err))
		return
	}

	if vehicle == nil {
		NotFound(w, fmt.Sprintf("Vehicle %v not found", id))
		return
	}

	StatusOK(w, VehicleWithLocationHistoryResponse{
		ID:              vehicle.ID,
		InUse:           vehicle.InUse,
		Battery:         vehicle.Battery,
		SerialNumber:    vehicle.SerialNumber,
		VehicleInfo:     vehicle.VehicleInfo,
		LocationHistory: locationHistory,
	})
}

// AddNew Vehicle API Endpoint
func AddVehicle(w http.ResponseWriter, r *http.Request) {
	vehicle, err := DecodeVehicle(r.Body)
	if err != nil {
		BadRequest(w, fmt.Sprintf("Error parsing form: %v", err))
		return
	}

	vehicleID, _, err := movr.AddVehicle(*vehicle)
	if err != nil {
		InternalServerError(w, fmt.Sprintf("Error creating new vehicle: %v", err))
		return
	}

	// Test that new vehicle was correctly added
	newVehicle, err := movr.GetVehicle(vehicleID)
	if err == pgx.ErrNoRows {
		NotFound(w, fmt.Sprintf("Vehicle with id %v NOT successfully added. Error: %v", vehicleID, err))
		return
	}
	if err != nil {
		InternalServerError(w, fmt.Sprintf("Error creating new vehicle: %v", err))
		return
	}

	StatusOK(w, newVehicle.ID)
}

// DeleteVehicle by ID API Endpoint
func DeleteVehicle(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := uuid.Parse(vars["vehicle-id"])
	if err != nil {
		BadRequest(w, fmt.Sprintf("Error parsing request: %v", err))
		return
	}

	err = movr.DeleteVehicle(id)
	if err == pgx.ErrNoRows {
		BadRequest(w, fmt.Sprintf("Vehicle %v not found in database or in use. Cannot delete it.", err))
		return
	}
	if err != nil {
		InternalServerError(w, fmt.Sprintf("Error deleting vehicle: %v", err))
		return
	}

	StatusOK(w, MessagesResponse{Messages: []string{fmt.Sprintf("Deleted vehicle with id %v from database.", id)}})
}
