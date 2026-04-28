package finance

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/doazhu/ai-control-finance/internal/auth"
	db "github.com/doazhu/ai-control-finance/internal/db/generated"
	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
)

type Handler struct {
	service *Service
}

func NewHandler(s *Service) *Handler {
	return &Handler{service: s}
}

type transactionRequest struct {
	Amount      string `json:"amount"`
	Type        string `json:"type"`
	Category    string `json:"category"`
	Description string `json:"description"`
	Date        string `json:"date"` // YYYY-MM-DD
}

type transactionResponse struct {
	ID          string `json:"id"`
	UserID      string `json:"user_id"`
	Amount      string `json:"amount"`
	Type        string `json:"type"`
	Category    string `json:"category"`
	Description string `json:"description"`
	Date        string `json:"date"`
	CreatedAt   string `json:"created_at"`
}

func toResponse(t db.Transaction) transactionResponse {
	category := ""
	if t.Note.Valid {
		category = t.Note.String
	}
	return transactionResponse{
		ID:          t.ID.String(),
		UserID:      t.UserID.String(),
		Amount:      t.Amount,
		Type:        string(t.Type),
		Category:    category,
		Description: t.Description,
		Date:        t.Date.Format("2006-01-02"),
		CreatedAt:   t.CreatedAt.Format(time.RFC3339),
	}
}

func writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(v)
}

func (h *Handler) HomePage(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintf(w, "FinAI API v1")
}

func (h *Handler) GetTransactions(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value(auth.UserIDKey).(uuid.UUID)

	transactions, err := h.service.GetTransactions(r.Context(), userID)
	if err != nil {
		http.Error(w, "failed to get transactions", http.StatusInternalServerError)
		return
	}

	result := make([]transactionResponse, len(transactions))
	for i, t := range transactions {
		result[i] = toResponse(t)
	}

	writeJSON(w, http.StatusOK, result)
}

func (h *Handler) CreateTransaction(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value(auth.UserIDKey).(uuid.UUID)

	var req transactionRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}

	date, err := time.Parse("2006-01-02", req.Date)
	if err != nil {
		http.Error(w, "invalid date format, use YYYY-MM-DD", http.StatusBadRequest)
		return
	}

	note := sql.NullString{String: req.Category, Valid: req.Category != ""}

	tx, err := h.service.CreateTransaction(
		r.Context(), userID,
		req.Amount,
		db.TransactionType(req.Type),
		sql.NullInt32{},
		req.Description,
		note,
		date,
	)
	if err != nil {
		http.Error(w, "failed to create transaction", http.StatusInternalServerError)
		return
	}

	writeJSON(w, http.StatusCreated, toResponse(tx))
}

func (h *Handler) UpdateTransaction(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value(auth.UserIDKey).(uuid.UUID)

	txID, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		http.Error(w, "invalid transaction id", http.StatusBadRequest)
		return
	}

	var req transactionRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}

	date, err := time.Parse("2006-01-02", req.Date)
	if err != nil {
		http.Error(w, "invalid date format, use YYYY-MM-DD", http.StatusBadRequest)
		return
	}

	note := sql.NullString{String: req.Category, Valid: req.Category != ""}

	tx, err := h.service.UpdateTransaction(
		r.Context(), txID, userID,
		req.Amount,
		db.TransactionType(req.Type),
		sql.NullInt32{},
		req.Description,
		note,
		date,
	)
	if err != nil {
		http.Error(w, "failed to update transaction", http.StatusInternalServerError)
		return
	}

	writeJSON(w, http.StatusOK, toResponse(tx))
}

func (h *Handler) DeleteTransaction(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value(auth.UserIDKey).(uuid.UUID)

	txID, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		http.Error(w, "invalid transaction id", http.StatusBadRequest)
		return
	}

	if err := h.service.DeleteTransaction(r.Context(), txID, userID); err != nil {
		http.Error(w, "failed to delete transaction", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func (h *Handler) TransactionPage(w http.ResponseWriter, r *http.Request) {
	h.GetTransactions(w, r)
}
