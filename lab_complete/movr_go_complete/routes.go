package main

import (
	"fmt"
	"github.com/gorilla/mux"
	"net/http"
	"os"
)

// InitializeRoutes wraps routes declarations.
func InitializeRoutes() *mux.Router {
	//
	// Gorilla Mux is a leading routes package
	// for Go. It is especially useful for REST
	// APIs with its flexible route path system,
	// used in the GetVehicleAndLocationHistory
	// as well as the DeleteVehicle endpoints.
	//

	routes := mux.NewRouter()

	api := routes.PathPrefix("/api").Subrouter()

	// Subrouting is another useful abstraction
	// from the Gorilla Mux package.

	u := api.PathPrefix("/users").Subrouter()
	v := api.PathPrefix("/vehicles").Subrouter()
	r := api.PathPrefix("/rides").Subrouter()

	api.HandleFunc("/login", Login)
	api.HandleFunc("/register", Register)
	u.HandleFunc("", GetUserProfile)
	u.HandleFunc("/delete", DeleteUser)

	v.HandleFunc("/add", AddVehicle)
	v.HandleFunc("", GetVehicles)
	v.HandleFunc("/{vehicle-id}", GetVehicleAndLocationHistory)
	v.HandleFunc("/{vehicle-id}/delete", DeleteVehicle)

	r.HandleFunc("/start", StartRide)
	r.HandleFunc("/active", GetActiveRide)
	r.HandleFunc("/end", EndRide)
	r.HandleFunc("", GetRidesByUser)

	// This route declaration registers the static
	// file server from which the React app will
	// be served.
	routes.PathPrefix("/").Handler(http.FileServer(http.Dir(os.Getenv("STATIC_FRONTEND_DIR"))))

	return routes
}

//Request logging for debugging purposes
func logRequest(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		fmt.Printf("%s: %s\n", r.Method, r.URL.RequestURI())

		next.ServeHTTP(w, r)
	})
}
