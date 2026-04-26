-- name: GetTransactions :many
SELECT * FROM transactions
WHERE user_id = $1
ORDER BY date DESC;

-- name: GetTransactionByID :one
SELECT * FROM transactions
WHERE id = $1 AND user_id = $2;

-- name: CreateTransaction :one
INSERT INTO transactions (user_id, amount, type, category_id, description, note, date)
VALUES ($1, $2, $3, $4, $5, $6, $7)
RETURNING *;

-- name: UpdateTransaction :one
UPDATE transactions
SET amount = $1, type = $2, category_id = $3, description = $4, note = $5, date = $6
WHERE id = $7 AND user_id = $8
RETURNING *;

-- name: DeleteTransaction :exec
DELETE FROM transactions
WHERE id = $1 AND user_id = $2;
