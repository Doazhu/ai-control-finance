package finance

import (
	"context"
	"database/sql"
	"time"

	db "github.com/doazhu/ai-control-finance/internal/db/generated"
	"github.com/google/uuid"
)

type Service struct {
	repo *Repository
}

func NewService(repo *Repository) *Service {
	return &Service{repo: repo}
}

func (s *Service) GetTransactions(ctx context.Context, userID uuid.UUID) ([]db.Transaction, error) {
	return s.repo.GetTransactions(ctx, userID)
}

func (s *Service) GetTransactionByID(ctx context.Context, id, userID uuid.UUID) (db.Transaction, error) {
	return s.repo.GetTransactionByID(ctx, id, userID)
}

func (s *Service) CreateTransaction(ctx context.Context, userID uuid.UUID, amount string, txType db.TransactionType, categoryID sql.NullInt32, description string, note sql.NullString, date time.Time) (db.Transaction, error) {
	return s.repo.CreateTransaction(ctx, userID, amount, txType, categoryID, description, note, date)
}

func (s *Service) UpdateTransaction(ctx context.Context, id, userID uuid.UUID, amount string, txType db.TransactionType, categoryID sql.NullInt32, description string, note sql.NullString, date time.Time) (db.Transaction, error) {
	return s.repo.UpdateTransaction(ctx, id, userID, amount, txType, categoryID, description, note, date)
}

func (s *Service) DeleteTransaction(ctx context.Context, id, userID uuid.UUID) error {
	return s.repo.DeleteTransaction(ctx, id, userID)
}
