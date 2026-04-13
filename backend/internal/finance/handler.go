package finance

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/google/uuid"
)

type Handler struct {
	service *Service
}

func NewHandler(s *Service) *Handler {
	return &Handler{service: s}
}

func (h *Handler) HomePage(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintf(w, "Endpoint Hit: homePage")
}

func (h *Handler) TransactionPage(w http.ResponseWriter, r *http.Request) {
	userID := uuid.MustParse("00000000-0000-0000-0000-000000000001")

	transactions, err := h.service.GetTransactions(r.Context(), userID)

	if err != nil {
		http.Error(w, "error", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(transactions)
}

func (h *Handler) ChatPage(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintf(w, "Endpoint Hit: ChatPage")
}
