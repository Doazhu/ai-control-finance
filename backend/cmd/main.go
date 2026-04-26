package main

import (
	"log"
	"net/http"
	"os"
	"time"

	"github.com/doazhu/ai-control-finance/internal/ai"
	"github.com/doazhu/ai-control-finance/internal/auth"
	"github.com/doazhu/ai-control-finance/internal/db"
	sqlc "github.com/doazhu/ai-control-finance/internal/db/generated"
	"github.com/doazhu/ai-control-finance/internal/finance"
	appmiddleware "github.com/doazhu/ai-control-finance/internal/middleware"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/joho/godotenv"
	"github.com/redis/go-redis/v9"
)

func main() {
	godotenv.Load()
	dsn := os.Getenv("POSTGRES_DSN")
	port := os.Getenv("PORT")

	conn, err := db.Connect(dsn)
	if err != nil {
		log.Fatal("failed to connect to database:", err)
	}

	// Redis
	rdb := redis.NewClient(&redis.Options{
		Addr: os.Getenv("REDIS_ADDR"),
	})

	// Rate limiters
	apiLimiter := appmiddleware.NewRateLimiter(rdb, 60, time.Minute) // 60 req/min для API
	aiLimiter := appmiddleware.NewRateLimiter(rdb, 10, time.Minute)  // 10 req/min для AI

	queries := sqlc.New(conn)

	financeRepo := finance.NewRepository(queries)
	financeSvc := finance.NewService(financeRepo)
	financeH := finance.NewHandler(financeSvc)

	authRepo := auth.NewRepository(queries)
	authSvc := auth.NewService(authRepo)
	authH := auth.NewHandler(authSvc)

	// ai
	aiClient := ai.NewClient()
	aiH := ai.NewHandler(aiClient, financeSvc)

	r := chi.NewRouter()
	r.Use(middleware.Logger)
	r.Use(apiLimiter.Middleware) // глобальный лимит на все запросы

	r.Get("/", financeH.HomePage)
	r.Route("/api/v1", func(r chi.Router) {
		r.Post("/auth/register", authH.Register)
		r.Post("/auth/login", authH.Login)

		r.Group(func(r chi.Router) {
			r.Use(auth.JWTMiddleware)
			r.With(aiLimiter.Middleware).Post("/chat", aiH.Chat) // отдельный лимит для AI
			r.Get("/transaction", financeH.GetTransactions)
			r.Post("/transaction", financeH.CreateTransaction)
			r.Put("/transaction/{id}", financeH.UpdateTransaction)
			r.Delete("/transaction/{id}", financeH.DeleteTransaction)
		})
	})

	log.Println("Server starting on :" + port)
	http.ListenAndServe(":"+port, r)
}
