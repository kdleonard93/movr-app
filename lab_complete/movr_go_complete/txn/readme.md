# Transactions Package

The transaction package houses the sql queries used to communicate with the CockroachDB database. 

While the transaction package contains the queries themselves, the movr package defines wrappers for the transactions that utilize CockroachDB's own wrapper. 

See: https://github.com/cockroachdb/cockroach-go/tree/master/crdb/crdbpgx

See also: https://github.com/jackc/pgx
