package main

import (
	"flag"
	"github.com/joho/godotenv"
	"log"
	"net/http"
	"os"
)

// MaxRecords is the default number of maximum records to return from an API call
const MaxRecords int = 20

// main entry point for app
func main() {
	// godotenv processes the .env file and makes the configuration variables available as environment variables within the application
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}

	// Debug mode is on by default. Use command line --debug=false
	// to disable the behavior. ex: go run . --debug=false
	// Debugging mode displays HTTP request logging on
	// the command line. It displays the HTTP method and
	// request URI in a human readable format.
	debug := flag.Bool("debug", true, "Enable debug mode")
	flag.Parse()

	// InitializeRoutes returns a *mux.Router. The application utilizes the gorilla mux package which is compatible with http.ListenAndServe.
	routes := InitializeRoutes()

	port := os.Getenv("SERVER_PORT")
	log.Printf("Web server running on http://localhost:%v/", port)

	// ListenAndServe dispatches all requests through the routes router.
	if *debug {
		log.Fatal(http.ListenAndServe(":"+port, logRequest(routes)))
	} else {
		log.Fatal(http.ListenAndServe(":"+port, routes))
	}
}
