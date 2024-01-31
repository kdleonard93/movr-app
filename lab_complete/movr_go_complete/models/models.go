package models

import (
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgtype"
)

// Response model for use in the GetVehicleAndLocationHistory Endpoint.
type VehicleWithLocation struct {
	VehicleID     uuid.UUID   `json:"id"`
	InUse         bool        `json:"in_use"`
	Battery       int         `json:"battery"`
	VehicleInfo   VehicleInfo `json:"vehicle_info"`
	LastCheckin   time.Time   `json:"last_checkin"`
	LastLatitude  float32     `json:"last_latitude"`
	LastLongitude float32     `json:"last_longitude"`
}

// Data model used by the GetRidesByUser transaction.
type UserRide struct {
	VehicleID   uuid.UUID   `json:"id"`
	VehicleInfo pgtype.JSON `json:"vehicle_info"`
	StartTs     *time.Time  `json:"start_time"`
	EndTs       *time.Time  `json:"end_time"`
	InUse       bool        `json:"in_use"`
}

// Helper struct to assist in the decoding of client request within the EndRide Endpoint.
type EndRideRequest struct {
	Email     string    `json:"email"`
	VehicleID uuid.UUID `json:"vehicle_id"`
	RideID    uuid.UUID `json:"ride_id"`
	Longitude string    `json:"longitude"`
	Latitude  string    `json:"latitude"`
	Battery   int       `json:"battery"`
	EndTime   time.Time `json:"end_time"`
	LongFloat float64
	LatFloat  float64
}

// Data model used by the AddVehicle transaction
type AddVehicleAndLocation struct {
	VehicleType     string      `json:"vehicle_type"`
	Color           string      `json:"color"`
	Manufacturer    string      `json:"manufacturer"`
	PurchaseDate    string      `json:"purchase_date"`
	SerialNumber    string      `json:"serial_number"`
	Wear            string      `json:"wear"`
	Longitude       float32     `json:"longitude"`
	Latitude        float32     `json:"latitude"`
	Battery         int         `json:"battery"`
	InUse           bool        `json:"in_use"`
	VehicleInfoByte pgtype.JSON `json:"vehicle_info"`
	SerialNumberInt int
}
