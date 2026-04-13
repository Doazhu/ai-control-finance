package main

import (
	"net/http"

	"github.com/doazhu/ai-control-finance/internal/finance"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
)

func main() {
	r := chi.NewRouter()
	r.Use(middleware.Logger)

	h := &finance.Handler{}
	r.Get("/", h.HomePage)

	r.Route("/api/v1", func(r chi.Router) {
		svc := &finance.Service{}
		h := finance.NewHandler(svc)

		r.Get("/chat", h.ChatPage)
		r.Get("/transaction", h.TransactionPage)
	})

	http.ListenAndServe(":3000", r)
}
