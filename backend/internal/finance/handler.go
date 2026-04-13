package finance

import (
	"fmt"
	"net/http"
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
	fmt.Fprintf(w, "Endpoint Hit: TransactionPage")

}

func (h *Handler) ChatPage(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintf(w, "Endpoint Hit: ChatPage")
}
