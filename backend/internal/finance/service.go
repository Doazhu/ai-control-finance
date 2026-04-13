package finance

import (
	"context"

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
