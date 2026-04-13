-- name: GetTransactions :many
SELECT * FROM transactions
WHERE user_id = $1
ORDER BY date DESC;
