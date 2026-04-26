package ai

import (
	"context"

	db "github.com/doazhu/ai-control-finance/internal/db/generated"
	"github.com/google/uuid"
)

type FinanceService interface {
	GetTransactions(ctx context.Context, userID uuid.UUID) ([]db.Transaction, error)
}
