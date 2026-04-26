package auth

import (
	"context"

	db "github.com/doazhu/ai-control-finance/internal/db/generated"
)

type Repository struct {
	queries *db.Queries
}

func NewRepository(q *db.Queries) *Repository {
	return &Repository{queries: q}
}

func (r *Repository) CreateUser(ctx context.Context, email, password string) (db.User, error) {
	return r.queries.CreateUser(ctx, db.CreateUserParams{
		Email:    email,
		Password: password,
	})
}

func (r *Repository) GetUserByEmail(ctx context.Context, email string) (db.User, error) {
	return r.queries.GetUserByEmail(ctx, email)
}
