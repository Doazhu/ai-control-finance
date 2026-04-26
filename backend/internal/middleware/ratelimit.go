package middleware

import (
	"context"
	"fmt"
	"net/http"
	"time"

	"github.com/redis/go-redis/v9"
)

// RateLimiter — middleware для ограничения частоты запросов через Redis
type RateLimiter struct {
	redis  *redis.Client
	limit  int           // максимум запросов
	window time.Duration // за какой период
}

func NewRateLimiter(rdb *redis.Client, limit int, window time.Duration) *RateLimiter {
	return &RateLimiter{
		redis:  rdb,
		limit:  limit,
		window: window,
	}
}

func (rl *RateLimiter) Middleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Ключ: IP адрес + путь запроса
		// Так разные эндпоинты имеют свои лимиты независимо
		ip := r.RemoteAddr
		key := fmt.Sprintf("rate_limit:%s:%s", ip, r.URL.Path)

		ctx := context.Background()

		// Инкрементируем счётчик запросов
		count, err := rl.redis.Incr(ctx, key).Result()
		if err != nil {
			// Если Redis недоступен — пропускаем запрос (fail open)
			next.ServeHTTP(w, r)
			return
		}

		// При первом запросе устанавливаем TTL
		if count == 1 {
			rl.redis.Expire(ctx, key, rl.window)
		}

		// Добавляем заголовки чтобы клиент знал о лимитах
		w.Header().Set("X-RateLimit-Limit", fmt.Sprintf("%d", rl.limit))
		w.Header().Set("X-RateLimit-Remaining", fmt.Sprintf("%d", max(0, int64(rl.limit)-count)))

		if count > int64(rl.limit) {
			http.Error(w, "too many requests", http.StatusTooManyRequests)
			return
		}

		next.ServeHTTP(w, r)
	})
}

func max(a, b int64) int64 {
	if a > b {
		return a
	}
	return b
}
