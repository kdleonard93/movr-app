package main

import (
	"encoding/json"
	"errors"
	"io"
	"io/ioutil"
	"strconv"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgtype"

	"github.com/umahmood/haversine"

	// Import local package models using Go modules
	"github.com/crdb/movrapp/models"
)

func RideSummaryCalculations(vehicleStart models.VehicleWithLocation, rideEnd models.EndRideRequest) (float32, float64, float64) {
	// Calculate distance using library based upon the haversine formula for geospatial calculations.
	startPoint := haversine.Coord{float64(vehicleStart.LastLatitude), float64(vehicleStart.LastLongitude)}
	endPoint := haversine.Coord{rideEnd.LatFloat, rideEnd.LongFloat}
	_, distKM := haversine.Distance(startPoint, endPoint)

	// Determine trip duration in minutes
	tripTime := rideEnd.EndTime.Sub(vehicleStart.LastCheckin)

	// Determine velocity by dividing distance traveled by time in hours
	return float32(distKM), tripTime.Minutes(), distKM / tripTime.Hours()
}

// Decode Start Ride decodes request body and returns vehicleID
// and User Email address.
func DecodeStartRide(body io.ReadCloser) (uuid.UUID, string, error) {
	readBody, err := ioutil.ReadAll(body)
	if err != nil {
		return uuid.Nil, "", err
	}

	var ride RideRequest

	err = json.Unmarshal(readBody, &ride)
	if err != nil {
		return uuid.Nil, "", err
	}

	vehicleID, err := uuid.Parse(ride.VehicleID)
	if err != nil {
		return uuid.Nil, "", err
	}
	if ride.Email == "" {
		return uuid.Nil, "", errors.New("Email not provided.")
	}

	return vehicleID, ride.Email, nil
}

// Decode End Ride decodes request body on the End Ride endpoint
// returning the EndRideRequest struct to be used within the
// End Ride handler.
func DecodeEndRide(body io.ReadCloser) (rideEnd *models.EndRideRequest, err error) {
	readBody, err := ioutil.ReadAll(body)
	if err != nil {
		return
	}

	err = json.Unmarshal(readBody, &rideEnd)

	rideEnd.LatFloat, err = strconv.ParseFloat(rideEnd.Latitude, 64)
	if err != nil {
		return
	}

	rideEnd.LongFloat, err = strconv.ParseFloat(rideEnd.Longitude, 64)
	if err != nil {
		return
	}

	rideEnd.EndTime = time.Now().UTC()

	return
}

// Decode User decodes the request body for use within the
// Registration handler, returning a UserProfile pointer.
func DecodeUser(body io.ReadCloser) (user *models.UserProfile, err error) {
	readBody, err := ioutil.ReadAll(body)
	if err != nil {
		return nil, err
	}

	err = json.Unmarshal(readBody, &user)
	if err != nil {
		return nil, err
	}

	// If user does not provide phone number, set phone_numbers = [""] instead of empty array.
	if len(user.PhoneNumbers) == 0 {
		user.PhoneNumbers = []string{""}
	}
	return
}

func DecodeLogin(body io.ReadCloser) (string, error) {
	readBody, err := ioutil.ReadAll(body)
	if err != nil {
		return "", err
	}

	var login map[string]string

	err = json.Unmarshal(readBody, &login)
	return login["email"], err
}

// Decode Vehicle decodes the request body for use within the Add
// Vehicle handler, returning a AddVehicleAndLocation pointer.
func DecodeVehicle(body io.ReadCloser) (*models.AddVehicleAndLocation, error) {
	readBody, err := ioutil.ReadAll(body)
	if err != nil {
		return nil, err
	}

	var v *models.AddVehicleAndLocation
	err = json.Unmarshal(readBody, &v)
	if err != nil {
		return nil, err
	}

	p := models.PurchaseInformation{
		Manufacturer: v.Manufacturer,
		SerialNumber: v.SerialNumber,
		PurchaseDate: v.PurchaseDate,
	}

	vi := models.VehicleInfo{
		VehicleType:         v.VehicleType,
		Color:               v.Color,
		Wear:                v.Wear,
		PurchaseInformation: p,
	}

	b, err := json.Marshal(vi)
	if err != nil {
		return nil, err
	}

	v.VehicleInfoByte = pgtype.JSON{
		Bytes:  b,
		Status: pgtype.Present,
	}

	return v, err
}
