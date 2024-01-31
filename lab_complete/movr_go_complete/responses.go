package main

import (
	"encoding/json"
	"net/http"

	"github.com/crdb/movrapp/models"
	"github.com/google/uuid"
)

// Wrapper serving 500 internal server errors to client
func InternalServerError(w http.ResponseWriter, message string) {
	w.WriteHeader(http.StatusInternalServerError)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(ErrorResponse{
		Message: message,
	})
}

// Wrapper serving 403 forbidden responses to client
func Forbidden(w http.ResponseWriter, message string) {
	w.WriteHeader(http.StatusForbidden)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(ErrorResponse{
		Message: message,
	})
}

// Wrapper serving 400 bad request responses to client
func BadRequest(w http.ResponseWriter, message string) {
	w.WriteHeader(http.StatusBadRequest)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(ErrorResponse{
		Message: message,
	})
}

// Wrapper serving 404 not found responses to the client
func NotFound(w http.ResponseWriter, message string) {
	w.WriteHeader(http.StatusNotFound)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(ErrorResponse{
		Message: message,
	})
}

// Wrapper serving 200 status OK responses to the client
// along with any data needed using the payload variable.
func StatusOK(w http.ResponseWriter, payload interface{}) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(payload)
}

// Simple response helper structs
type ErrorResponse struct {
	Message string `json:"message"`
}

type LoginResponse struct {
	IsAuthenticated bool `json:"is_authenticated"`
}

type MessagesResponse struct {
	Messages []string `json:"messages"`
}

type RideRequest struct {
	VehicleID string `json:"vehicle_id"`
	Email     string `json:"email;omitempty"`
}

// Response model for use in the GetVehicleAndLocationHistory Endpoint.
type VehicleWithLocationHistoryResponse struct {
	ID              uuid.UUID                `json:"id"`
	InUse           bool                     `json:"in_use"`
	Battery         int                      `json:"battery"`
	SerialNumber    int                      `json:"serial_number"`
	VehicleInfo     models.VehicleInfo       `json:"vehicle_info"`
	LocationHistory []models.LocationHistory `json:"locationHistory"`
}

// Response model for use in the StartRide Endpoint.
type RideResponse struct {
	Ride     *models.Ride `json:"ride"`
	Messages []string     `json:"messages"`
}

// Response model for use in the GetUserProfile Endpoint.
type UserProfileResponse struct {
	User     *models.UserProfile `json:"user"`
	Messages []string            `json:"messages"`
}
