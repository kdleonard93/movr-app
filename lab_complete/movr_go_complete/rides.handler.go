package main

import (
	"fmt"
	"net/http"

	"github.com/google/uuid"

	// Local packages movr & models imported using Go modules
	"github.com/crdb/movrapp/movr"
)

//
// Rides Endpoints
//
// rides.handler.go contains four Movr API Endpoints:
// 	   StartRide, GetActiveRide, EndRide
//   	   & GetRidesByUser
//
// See responses.go & helpers.go
//

// StartRide API Endpoint
func StartRide(w http.ResponseWriter, r *http.Request) {
	vehicleID, riderEmail, err := DecodeStartRide(r.Body)
	if err != nil {
		BadRequest(w, fmt.Sprintf("Error parsing form: %v.", err))
		return
	}

	ride, err := movr.StartRide(vehicleID, riderEmail)
	if err != nil {
		InternalServerError(w, fmt.Sprintf("Error starting new ride: %v.", err))
		return
	}

	StatusOK(w, RideResponse{
		Ride:     ride,
		Messages: []string{fmt.Sprintf("Ride started with vehicle %v.", vehicleID)},
	})
}

// GetActiveRide API Endpoint
func GetActiveRide(w http.ResponseWriter, r *http.Request) {
	email := r.URL.Query().Get("email")
	vehicleID, err := uuid.Parse(r.URL.Query().Get("vehicle_id"))
	if err != nil {
		BadRequest(w, fmt.Sprintf("Error parsing request, bad vehicle ID: %v.", err))
		return
	}
	if email == "" {
		BadRequest(w, "You must login to view this page.")
		return
	}

	// assign rideID to blank identifier as it's unused within GetActiveRide
	ride, _, err := movr.GetActiveRide(vehicleID, email)
	if err != nil {
		InternalServerError(w, fmt.Sprintf("Error getting data: %v.", err))
		return
	}

	if ride == nil {
		NotFound(w, fmt.Sprintf("Ride %v not found.", vehicleID))
		return
	}

	StatusOK(w, ride)
}

// EndRide API Endpoint
func EndRide(w http.ResponseWriter, r *http.Request) {
	rideEnd, err := DecodeEndRide(r.Body)
	if err != nil {
		BadRequest(w, fmt.Sprintf("Error parsing form: %v.", err))
		return
	}

	vehicleAtStart, rideID, err := movr.GetActiveRide(rideEnd.VehicleID, rideEnd.Email)
	if err != nil {
		BadRequest(w, fmt.Sprintf("Cannot view the ride for this vehicle. It is not currently in use, or you are not the rider: %v.", err))
		return
	}

	err = movr.EndRide(rideID, rideEnd.LatFloat, rideEnd.LongFloat, rideEnd.Battery, rideEnd.EndTime)
	if err != nil {
		InternalServerError(w, fmt.Sprintf("Error ending ride: %v.", err))
		return
	}

	distance, duration, velocity := RideSummaryCalculations(*vehicleAtStart, *rideEnd)

	StatusOK(w, MessagesResponse{
		Messages: []string{
			fmt.Sprintf("You have completed your ride on vehicle %v.", rideEnd.VehicleID),
			fmt.Sprintf("You traveled %.02f km in %.02f minutes for an average velocity of %.03f km/h.", distance, duration, velocity),
		},
	})
}

// GetRidesByUser API Endpoint
func GetRidesByUser(w http.ResponseWriter, r *http.Request) {
	userEmail := r.URL.Query().Get("email")
	if userEmail == "" {
		BadRequest(w, "You must login to view this page")
		return
	}

	rides, err := movr.GetRidesByUser(userEmail)
	if err != nil {
		InternalServerError(w, fmt.Sprintf("Error getting data: %v.", err))
		return
	}

	StatusOK(w, rides)
}
