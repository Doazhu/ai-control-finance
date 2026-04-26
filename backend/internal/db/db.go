package db

import (
	"database/sql"

	_ "github.com/jackc/pgx/v5/stdlib"
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
