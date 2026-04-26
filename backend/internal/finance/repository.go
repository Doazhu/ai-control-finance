package finance

import (
	"context"
	"database/sql"
	"time"

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

func (r *Repository) GetTransactionByID(ctx context.Context, id, userID uuid.UUID) (db.Transaction, error) {
	return r.queries.GetTransactionByID(ctx, db.GetTransactionByIDParams{
		ID:     id,
		UserID: userID,
	})
}

func (r *Repository) CreateTransaction(ctx context.Context, userID uuid.UUID, amount string, txType db.TransactionType, categoryID sql.NullInt32, description string, note sql.NullString, date time.Time) (db.Transaction, error) {
	return r.queries.CreateTransaction(ctx, db.CreateTransactionParams{
		UserID:      userID,
		Amount:      amount,
		Type:        txType,
		CategoryID:  categoryID,
		Description: description,
		Note:        note,
		Date:        date,
	})
}

func (r *Repository) UpdateTransaction(ctx context.Context, id, userID uuid.UUID, amount string, txType db.TransactionType, categoryID sql.NullInt32, description string, note sql.NullString, date time.Time) (db.Transaction, error) {
	return r.queries.UpdateTransaction(ctx, db.UpdateTransactionParams{
		ID:          id,
		UserID:      userID,
		Amount:      amount,
		Type:        txType,
		CategoryID:  categoryID,
		Description: description,
		Note:        note,
		Date:        date,
	})
}

func (r *Repository) DeleteTransaction(ctx context.Context, id, userID uuid.UUID) error {
	return r.queries.DeleteTransaction(ctx, db.DeleteTransactionParams{
		ID:     id,
		UserID: userID,
	})
}
