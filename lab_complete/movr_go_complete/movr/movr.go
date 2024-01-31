package movr

import (
	"context"
	"log"
	"os"

	"github.com/jackc/pgx/v4"
)

//
// GetConnection initializes and opens a database connection.
// Note that this database configuration does not utilize
// connection pooling. If connection pooling is desired,
// a connection pool would need to be created and passed to
// a similar function.
//
// See: https://godoc.org/github.com/jackc/pgx/pgxpool for
// more information
//
func GetConnection() *pgx.Conn {
	config, err := pgx.ParseConfig(os.Getenv("PGX_CONNECTION_STRING"))
	if err != nil {
		log.Fatal("error configuring the database: ", err)
	}

	// connect to database
	conn, err := pgx.ConnectConfig(context.Background(), config)
	if err != nil {
		log.Fatal("error connecting to the database: ", err)
	}

	return conn
}
