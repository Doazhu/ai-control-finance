// Base API client — автоматически подставляет Bearer токен из localStorage

const BASE = '/api/v1'

function getToken(): string | null {
  try {
    const raw = localStorage.getItem('finai-auth')
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return parsed?.state?.token ?? null
  } catch {
    return null
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }
  if (token) headers['Authorization'] = `Bearer ${token}`

  let res: Response
  try {
    res = await fetch(`${BASE}${path}`, { ...options, headers })
  } catch (e) {
    throw new Error('Нет соединения с сервером. Проверь, что бэкенд запущен.')
  }

  if (res.status === 401) {
    localStorage.removeItem('finai-auth')
    window.location.href = '/login'
    throw new Error('Сессия истекла, войдите снова')
  }

  // Пустой успешный ответ
  if (res.status === 204) return undefined as T

  // Читаем тело один раз
  const text = await res.text()

  if (!res.ok) {
    throw new Error(text.trim() || `Ошибка сервера: HTTP ${res.status}`)
  }

  // Пустое тело при 200 — возвращаем undefined
  if (!text.trim()) return undefined as T

  try {
    return JSON.parse(text) as T
  } catch {
    console.error('Не удалось разобрать ответ сервера:', text.slice(0, 200))
    throw new Error('Сервер вернул некорректный ответ. Возможно, бэкенд не запущен.')
  }
}

export const api = {
  get:    <T>(path: string)                => request<T>(path, { method: 'GET' }),
  post:   <T>(path: string, body: unknown) => request<T>(path, { method: 'POST',   body: JSON.stringify(body) }),
  put:    <T>(path: string, body: unknown) => request<T>(path, { method: 'PUT',    body: JSON.stringify(body) }),
  delete: <T>(path: string)               => request<T>(path, { method: 'DELETE' }),
}
