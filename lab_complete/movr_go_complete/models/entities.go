package models

import (
	"time"

	"github.com/google/uuid"
)

//
// Entities are defined in this file that
// correspond with the database model and
// enable communication with the client.
//

type UserProfile struct {
	Email        string   `json:"email"`
	LastName     string   `json:"last_name"`
	FirstName    string   `json:"first_name"`
	PhoneNumbers []string `json:"phone_numbers,omitempty"`
}

type Vehicle struct {
	ID           uuid.UUID   `json:"id"`
	InUse        bool        `json:"in_use"`
	Battery      int         `json:"battery"`
	VehicleInfo  VehicleInfo `json:"vehicle_info"`
	SerialNumber int         `json:"serial_number"`
}

type VehicleInfo struct {
	Color               string              `json:"color"`
	PurchaseInformation PurchaseInformation `json:"purchase_information"`
	VehicleType         string              `json:"type"`
	Wear                string              `json:"wear"`
}

type PurchaseInformation struct {
	Manufacturer string `json:"manufacturer"`
	PurchaseDate string `json:"purchase_date"`
	SerialNumber string `json:"serial_number"`
}

type LocationHistory struct {
	ID        uuid.UUID `json:"id"`
	VehicleID uuid.UUID `json:"vehicle_id"`
	Timestamp time.Time `json:"ts"`
	Longitude float32   `json:"longitude"`
	Latitude  float32   `json:"latitude"`
}

type Ride struct {
	ID        uuid.UUID `json:"id"`
	VehicleID uuid.UUID `json:"vehicle_id"`
	UserEmail string    `json:"user_email"`
	StartTS   time.Time `json:"start_ts"`
	EndTS     time.Time `json:"end_ts"`
}
