package txn

import (
	"context"

	"github.com/jackc/pgx/v4"

	//Import local package models using Go modules
	"github.com/crdb/movrapp/models"
)

// GetUserTx gets a single user object.
//
// Arguments:
//         ctx {Context} -- The context that allows for cancellation signals across API boundaries.
//         tx {Tx} -- represents a database transaction.
//         email {string} -- The user's email address.
//
// Returns:
//         {*models.UserProfile} -- User entity.
//
func GetUserTx(ctx context.Context, tx pgx.Tx, email string) (*models.UserProfile, error) {
	row := tx.QueryRow(ctx,
		`SELECT
			email,
			last_name,
			first_name,
			phone_numbers
                FROM
			users
                WHERE email = $1`, email)

	var user models.UserProfile
	if err := row.Scan(
		&user.Email,
		&user.LastName,
		&user.FirstName,
		&user.PhoneNumbers); err != nil {
		return nil, err
	}

	return &user, nil
}

// AddUserTx adds a new row to the User table.
//
// Arguments:
//         ctx {Context} -- The context that allows for cancellation signals across API boundaries.
//         tx {Tx} -- represents a database transaction.
//         user {*models.UserProfile} -- User entity.
//
func AddUserTx(ctx context.Context, tx pgx.Tx, user *models.UserProfile) error {
	var err error
	_, err = tx.Exec(ctx,
		`INSERT INTO users (email, last_name, first_name, phone_numbers)
		VALUES ($1, $2, $3, $4)`, user.Email, user.LastName, user.FirstName, user.PhoneNumbers)

	return err
}

// DeleteUserTx removes a row from the users table.
//
// Arguments:
//         ctx {Context} -- The context that allows for cancellation signals across API boundaries.
//         tx {Tx} -- represents a database transaction.
//         email {string} -- The user's email address.
//
func DeleteUserTx(ctx context.Context, tx pgx.Tx, email string) error {
	_, err := tx.Exec(ctx,
		`DELETE
		FROM
			users
                WHERE email = $1`, email)
	return err
}
