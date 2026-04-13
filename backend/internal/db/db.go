package db

import (
	"database/sql"
)

func Connect(dsn string) (*sql.DB, error) {
	ccon, err := sql.Open("pgx", dsn)

	if err != nil {
		return nil, err
	}

	if err := ccon.Ping(); err != nil {
		return nil, err
	}

	return ccon, nil
}
