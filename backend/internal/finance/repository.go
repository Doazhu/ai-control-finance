package finance

import (
	"context"

	db "github.com/doazhu/ai-control-finance/internal/db/generated"
	"github.com/google/uuid"
)

type Repository struct {
	queries *db.Queries
}

func NewRepository(q *db.Queries) *Repository {
	return &Repository{queries: q}
}

func (r *Repository) GetTransactions(ctx context.Context, userID uuid.UUID) ([]db.Transaction, error) {
	return r.queries.GetTransactions(ctx, userID)
}
