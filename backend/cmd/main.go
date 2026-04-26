package main

import (
	"log"
	"net/http"
	"os"

	"github.com/doazhu/ai-control-finance/internal/auth"
	"github.com/doazhu/ai-control-finance/internal/db"
	sqlc "github.com/doazhu/ai-control-finance/internal/db/generated"
	"github.com/doazhu/ai-control-finance/internal/finance"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/joho/godotenv"
)

func main() {
	godotenv.Load()
	dsn := os.Getenv("POSTGRES_DSN")
	port := os.Getenv("PORT")

	conn, err := db.Connect(dsn)
	if err != nil {
		log.Fatal("failed to connect to database:", err)
	}

	queries := sqlc.New(conn)

	financeRepo := finance.NewRepository(queries)
	financeSvc := finance.NewService(financeRepo)
	financeH := finance.NewHandler(financeSvc)

	authRepo := auth.NewRepository(queries)
	authSvc := auth.NewService(authRepo)
	authH := auth.NewHandler(authSvc)

	r := chi.NewRouter()
	r.Use(middleware.Logger)

	r.Get("/", financeH.HomePage)
	r.Route("/api/v1", func(r chi.Router) {
		r.Post("/auth/register", authH.Register)
		r.Post("/auth/login", authH.Login)

		r.Group(func(r chi.Router) {
			r.Use(auth.JWTMiddleware)
			r.Get("/chat", financeH.ChatPage)
			r.Get("/transaction", financeH.GetTransactions)
			r.Post("/transaction", financeH.CreateTransaction)
			r.Put("/transaction/{id}", financeH.UpdateTransaction)
			r.Delete("/transaction/{id}", financeH.DeleteTransaction)
		})
	})

	log.Println("Server starting on :" + port)
	http.ListenAndServe(":"+port, r)
}
