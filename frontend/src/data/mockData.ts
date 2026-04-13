import { Transaction } from '../types'

export const mockTransactions: Transaction[] = [
  { id: '1', description: 'Зарплата', amount: 120000, category: 'Зарплата', type: 'income', date: '2026-04-01' },
  { id: '2', description: 'Аренда квартиры', amount: 35000, category: 'Жильё', type: 'expense', date: '2026-04-02' },
  { id: '3', description: 'Продукты / ВкусВилл', amount: 4200, category: 'Продукты', type: 'expense', date: '2026-04-03' },
  { id: '4', description: 'Фриланс — дизайн', amount: 25000, category: 'Фриланс', type: 'income', date: '2026-04-04' },
  { id: '5', description: 'Netflix', amount: 799, category: 'Подписки', type: 'expense', date: '2026-04-05' },
  { id: '6', description: 'Такси / Яндекс', amount: 1200, category: 'Транспорт', type: 'expense', date: '2026-04-06' },
  { id: '7', description: 'Ресторан Сыроварня', amount: 3800, category: 'Еда вне дома', type: 'expense', date: '2026-04-07' },
  { id: '8', description: 'Спортзал', amount: 3500, category: 'Здоровье', type: 'expense', date: '2026-04-08' },
  { id: '9', description: 'Продукты / Пятёрочка', amount: 2100, category: 'Продукты', type: 'expense', date: '2026-04-09' },
  { id: '10', description: 'Кино / Кинопоиск', amount: 399, category: 'Подписки', type: 'expense', date: '2026-04-10' },
  { id: '11', description: 'Перевод от друга', amount: 5000, category: 'Прочее', type: 'income', date: '2026-04-11' },
  { id: '12', description: 'Аптека', amount: 1600, category: 'Здоровье', type: 'expense', date: '2026-04-12' },
]

export const balanceHistory = [
  { date: 'Ноя', balance: 85000 },
  { date: 'Дек', balance: 102000 },
  { date: 'Янв', balance: 94000 },
  { date: 'Фев', balance: 118000 },
  { date: 'Мар', balance: 131000 },
  { date: 'Апр', balance: 157000 },
]

export const expensesByCategory = [
  { name: 'Жильё', amount: 35000 },
  { name: 'Продукты', amount: 6300 },
  { name: 'Еда вне дома', amount: 3800 },
  { name: 'Транспорт', amount: 1200 },
  { name: 'Здоровье', amount: 5100 },
  { name: 'Подписки', amount: 1198 },
  { name: 'Прочее', amount: 0 },
]
