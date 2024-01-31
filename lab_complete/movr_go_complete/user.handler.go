package main

import (
	"fmt"
	"net/http"

	// Use go modules to import movr package
	"github.com/crdb/movrapp/movr"
)

//
// User Endpoints
//
// user.handler.go contains four Movr API Endpoints:
// 	  Login, Register, GetUserProfile & DeleteUser
//
// See responses.go & helpers.go
//

// Login API Endpoint
func Login(w http.ResponseWriter, r *http.Request) {
	email, err := DecodeLogin(r.Body)
	if err != nil {
		BadRequest(w, fmt.Sprintf("Bad request from client: %v", err))
		return
	}

	user, err := movr.GetUser(email)
	if user == nil {
		NotFound(w, fmt.Sprintf("User Email %v Not Found.", email))
		return
	}

	if err != nil {
		InternalServerError(w, fmt.Sprintf("Error getting data: %v.", err))
		return
	}

	StatusOK(w, LoginResponse{IsAuthenticated: user != nil})
}

// Register API Endpoint
func Register(w http.ResponseWriter, r *http.Request) {
	user, err := DecodeUser(r.Body)
	if err != nil {
		BadRequest(w, fmt.Sprintf("Error parsing form: %v", err))
		return
	}

	if err = movr.RegisterUser(user); err != nil {
		InternalServerError(w, fmt.Sprintf("Error creating new user: %v", err))
		return
	}

	StatusOK(w, MessagesResponse{Messages: []string{fmt.Sprintf("User successfully created.")}})
}

// GetUserProfile by ID API Endpoint
func GetUserProfile(w http.ResponseWriter, r *http.Request) {
	email := r.URL.Query().Get("email")
	if email == "" {
		Forbidden(w, "You must log in to view this page.")
		return
	}

	user, err := movr.GetUser(email)
	if user == nil {
		NotFound(w, fmt.Sprintf("Error getting data: %v.", err))
		return
	}
	if err != nil {
		InternalServerError(w, fmt.Sprintf("Error getting data: %v.", err))
		return
	}

	StatusOK(w, UserProfileResponse{
		User:     user,
		Messages: []string{},
	})
}

// DeleteUser by ID API Endpoint
func DeleteUser(w http.ResponseWriter, r *http.Request) {
	email := r.URL.Query().Get("email")

	err := movr.DeleteUser(email)
	if err != nil {
		InternalServerError(w, fmt.Sprintf("Error deleting user: %v.", err))
		return
	}

	StatusOK(w, MessagesResponse{Messages: []string{fmt.Sprintf("You have successfully deleted your account.")}})
}
