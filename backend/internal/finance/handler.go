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
	Amount      string  `json:"amount"`
	Type        string  `json:"type"`
	CategoryID  *int32  `json:"category_id"`
	Description string  `json:"description"`
	Note        *string `json:"note"`
	Date        string  `json:"date"` // формат: 2006-01-02
}

// transactionResponse — чистый JSON без sql.Null* типов
type transactionResponse struct {
	ID          uuid.UUID `json:"id"`
	UserID      uuid.UUID `json:"user_id"`
	Amount      string    `json:"amount"`
	Type        string    `json:"type"`
	CategoryID  *int32    `json:"category_id"`
	Description string    `json:"description"`
	Note        *string   `json:"note"`
	Date        string    `json:"date"`
	CreatedAt   time.Time `json:"created_at"`
}

// toResponse конвертирует db.Transaction в чистый JSON-ответ
func toResponse(t db.Transaction) transactionResponse {
	res := transactionResponse{
		ID:          t.ID,
		UserID:      t.UserID,
		Amount:      t.Amount,
		Type:        string(t.Type),
		Description: t.Description,
		Date:        t.Date.Format("2006-01-02"),
		CreatedAt:   t.CreatedAt,
	}
	if t.CategoryID.Valid {
		res.CategoryID = &t.CategoryID.Int32
	}
	if t.Note.Valid {
		res.Note = &t.Note.String
	}
	return res
}

func (h *Handler) HomePage(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintf(w, "Endpoint Hit: homePage")
}

func (h *Handler) ChatPage(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintf(w, "Endpoint Hit: ChatPage")
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

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(result)
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

	categoryID := sql.NullInt32{}
	if req.CategoryID != nil {
		categoryID = sql.NullInt32{Int32: *req.CategoryID, Valid: true}
	}

	note := sql.NullString{}
	if req.Note != nil {
		note = sql.NullString{String: *req.Note, Valid: true}
	}

	tx, err := h.service.CreateTransaction(r.Context(), userID, req.Amount, db.TransactionType(req.Type), categoryID, req.Description, note, date)
	if err != nil {
		http.Error(w, "failed to create transaction", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(toResponse(tx))
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

	categoryID := sql.NullInt32{}
	if req.CategoryID != nil {
		categoryID = sql.NullInt32{Int32: *req.CategoryID, Valid: true}
	}

	note := sql.NullString{}
	if req.Note != nil {
		note = sql.NullString{String: *req.Note, Valid: true}
	}

	tx, err := h.service.UpdateTransaction(r.Context(), txID, userID, req.Amount, db.TransactionType(req.Type), categoryID, req.Description, note, date)
	if err != nil {
		http.Error(w, "failed to update transaction", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(toResponse(tx))
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
