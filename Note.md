## запуск фронта

```bash
cd frontend
npm run dev
```

## Установка зависимостей:
```bash
cd frontend
npm install
```

# Сначала подними базу и Redis (если не запущены)
cd /Users/doazhu/Documents/ai-control-finance
docker compose up -d postgres redis

# Потом запусти Go сервер
cd backend
go run ./cmd/main.go