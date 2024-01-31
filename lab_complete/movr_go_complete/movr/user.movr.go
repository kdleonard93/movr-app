package movr

import (
	"context"

	"github.com/cockroachdb/cockroach-go/v2/crdb/crdbpgx"
	"github.com/jackc/pgx/v4"

	// Use go modules to import models & txn local packages
	"github.com/crdb/movrapp/models"
	"github.com/crdb/movrapp/txn"
)

// Get User returns a user object by email from the database.
func GetUser(email string) (*models.UserProfile, error) {
	var user *models.UserProfile
	conn := GetConnection()
	ctx := context.Background()
	defer conn.Close(ctx)

	err := crdbpgx.ExecuteTx(ctx, crdbpgx.Conn(conn), pgx.TxOptions{}, func(tx pgx.Tx) error {
		var err error
		user, err = txn.GetUserTx(ctx, tx, email)
		return err
	})

	return user, err
}

// Add User adds a new user object into the database.
func RegisterUser(user *models.UserProfile) error {
	conn := GetConnection()
	ctx := context.Background()
	defer conn.Close(ctx)

	err := crdbpgx.ExecuteTx(ctx, crdbpgx.Conn(conn), pgx.TxOptions{}, func(tx pgx.Tx) error {
		var err error
		err = txn.AddUserTx(ctx, tx, user)
		return err
	})

	return err
}

// Delete User removes a user object from the database identified by its email.
func DeleteUser(email string) error {
	conn := GetConnection()
	ctx := context.Background()
	defer conn.Close(ctx)

	err := crdbpgx.ExecuteTx(ctx, crdbpgx.Conn(conn), pgx.TxOptions{}, func(tx pgx.Tx) error {
		var err error
		err = txn.DeleteUserTx(ctx, tx, email)
		return err
	})

	return err
}
