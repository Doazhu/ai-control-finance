import { useState, useRef, useCallback } from 'react'
import { Upload, FileText, Trash2, Check, X, AlertCircle, Loader2, Edit2 } from 'lucide-react'
// XLSX подгружается лениво только при открытии модала
type XLSXModule = typeof import('xlsx')
import Modal from './Modal'
import { useTransactionStore } from '../store/useTransactionStore'
import { Transaction } from '../types'

type ImportRow = Omit<Transaction, 'id'> & { _key: number; _err?: string }

const catEmoji: Record<string, string> = {
  'Зарплата': '💼', 'Фриланс': '🎨', 'Жильё': '🏠',
  'Продукты': '🛒', 'Транспорт': '🚗', 'Здоровье': '💊',
  'Подписки': '📱', 'Еда вне дома': '🍽', 'Прочее': '💰',
  'Еда': '🍽', 'Развлечения': '🎮', 'Одежда': '👗',
}
const CATS = ['Зарплата', 'Фриланс', 'Жильё', 'Продукты', 'Транспорт',
              'Здоровье', 'Подписки', 'Еда вне дома', 'Прочее']

// ── Парсеры ──────────────────────────────────────────────────────────────────
function normalizeDate(raw: string): string {
  // Принимаем DD.MM.YYYY, MM/DD/YYYY, YYYY-MM-DD
  if (!raw) return new Date().toISOString().slice(0, 10)
  const iso = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (iso) return raw
  const ru = raw.match(/^(\d{2})\.(\d{2})\.(\d{4})$/)
  if (ru) return `${ru[3]}-${ru[2]}-${ru[1]}`
  const us = raw.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
  if (us) return `${us[3]}-${us[1]}-${us[2]}`
  // Excel serial number
  const n = Number(raw)
  if (!isNaN(n) && n > 40000) {
    const d = new Date((n - 25569) * 86400 * 1000)
    return d.toISOString().slice(0, 10)
  }
  return new Date().toISOString().slice(0, 10)
}

function normalizeType(raw: string): 'income' | 'expense' {
  const v = (raw ?? '').toLowerCase().trim()
  if (['income', 'доход', 'приход', '+'].includes(v)) return 'income'
  return 'expense'
}

function normalizeAmount(raw: string | number): number {
  if (typeof raw === 'number') return Math.abs(raw)
  const cleaned = String(raw).replace(/[^\d.,\-]/g, '').replace(',', '.')
  return Math.abs(parseFloat(cleaned) || 0)
}

function rowsFromSheetData(data: Record<string, string>[]): ImportRow[] {
  return data.map((row, i) => {
    // Ищем колонки по возможным названиям
    const get = (...keys: string[]) => {
      for (const k of keys) {
        const found = Object.keys(row).find(rk => rk.toLowerCase().includes(k.toLowerCase()))
        if (found) return row[found] ?? ''
      }
      return ''
    }

    const amount = normalizeAmount(get('amount', 'сумма', 'sum', 'value'))
    const type   = normalizeType(get('type', 'тип', 'вид'))
    const date   = normalizeDate(get('date', 'дата', 'when'))
    const desc   = get('description', 'описание', 'name', 'title', 'наименование', 'назначение') || 'Без описания'
    const cat    = get('category', 'категория', 'cat') || 'Прочее'

    return {
      _key:        i,
      _err:        amount === 0 ? 'Нулевая сумма' : undefined,
      description: desc,
      amount,
      type,
      category:    cat,
      date,
    }
  })
}

function parseCSV(text: string): ImportRow[] {
  const lines = text.trim().split(/\r?\n/)
  if (lines.length < 2) return []
  const sep = lines[0].includes(';') ? ';' : ','
  const headers = lines[0].split(sep).map(h => h.trim().replace(/^"|"$/g, ''))
  const data = lines.slice(1).map(line => {
    const vals = line.split(sep).map(v => v.trim().replace(/^"|"$/g, ''))
    return Object.fromEntries(headers.map((h, i) => [h, vals[i] ?? '']))
  })
  return rowsFromSheetData(data)
}

async function parseExcel(buf: ArrayBuffer): Promise<ImportRow[]> {
  const XLSX: XLSXModule = await import('xlsx')
  const wb = XLSX.read(buf, { type: 'array' })
  const ws = wb.Sheets[wb.SheetNames[0]]
  const data = XLSX.utils.sheet_to_json<Record<string, string>>(ws, { defval: '' })
  return rowsFromSheetData(data)
}

function parseJSON(text: string): ImportRow[] {
  try {
    const raw = JSON.parse(text)
    const arr: Record<string, string>[] = Array.isArray(raw) ? raw : raw.transactions ?? raw.data ?? []
    return rowsFromSheetData(arr)
  } catch {
    throw new Error('Некорректный JSON')
  }
}

// ── Компонент ─────────────────────────────────────────────────────────────────
interface Props { open: boolean; onClose: () => void }

export default function ImportModal({ open, onClose }: Props) {
  const addTransaction = useTransactionStore(s => s.addTransaction)

  const [rows, setRows]       = useState<ImportRow[]>([])
  const [fileName, setFileName] = useState('')
  const [dragging, setDragging] = useState(false)
  const [parseErr, setParseErr] = useState('')
  const [editIdx, setEditIdx]  = useState<number | null>(null)
  const [saving, setSaving]    = useState(false)
  const [done, setDone]        = useState(0)
  const fileRef = useRef<HTMLInputElement>(null)

  const fmt = (n: number) =>
    new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(n)

  const handleFile = useCallback(async (file: File) => {
    setParseErr('')
    setRows([])
    setFileName(file.name)
    setDone(0)
    try {
      let parsed: ImportRow[] = []
      if (file.name.endsWith('.csv') || file.type === 'text/csv') {
        parsed = parseCSV(await file.text())
      } else if (file.name.match(/\.xlsx?$/)) {
        parsed = await parseExcel(await file.arrayBuffer())
      } else if (file.name.endsWith('.json')) {
        parsed = parseJSON(await file.text())
      } else {
        throw new Error('Поддерживаются форматы: .csv, .xlsx, .xls, .json')
      }
      if (!parsed.length) throw new Error('Файл пустой или не содержит транзакций')
      setRows(parsed)
    } catch (e) {
      setParseErr(e instanceof Error ? e.message : 'Ошибка разбора файла')
    }
  }, [])

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [handleFile])

  const removeRow  = (key: number) => setRows(r => r.filter(x => x._key !== key))
  const updateRow  = (key: number, patch: Partial<ImportRow>) =>
    setRows(r => r.map(x => x._key === key ? { ...x, ...patch } : x))

  const validRows = rows.filter(r => !r._err && r.amount > 0)

  const handleImport = async () => {
    if (!validRows.length) return
    setSaving(true)
    let count = 0
    for (const row of validRows) {
      try {
        await addTransaction({
          description: row.description,
          amount:      row.amount,
          type:        row.type,
          category:    row.category,
          date:        row.date,
        })
        count++
        setDone(count)
      } catch { /* продолжаем */ }
    }
    setSaving(false)
    setTimeout(() => {
      setRows([]); setFileName(''); setDone(0); onClose()
    }, 800)
  }

  const handleClose = () => {
    if (saving) return
    setRows([]); setFileName(''); setParseErr(''); setDone(0); onClose()
  }

  return (
    <Modal open={open} onClose={handleClose} title="Импорт транзакций" size="lg">
      <div className="space-y-4">

        {/* Форматы */}
        <div className="flex gap-2 flex-wrap">
          {[
            { ext: 'CSV', desc: 'date,description,amount,type,category' },
            { ext: 'XLSX', desc: 'Excel таблица с заголовками' },
            { ext: 'JSON', desc: 'Массив объектов транзакций' },
          ].map(f => (
            <div key={f.ext} className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-xl border border-white/8">
              <FileText size={12} className="text-cyan-400" />
              <span className="text-[10px] font-black text-cyan-400">.{f.ext}</span>
              <span className="text-[10px] text-gray-500 hidden sm:inline">{f.desc}</span>
            </div>
          ))}
        </div>

        {/* Drop zone */}
        {!rows.length && (
          <div
            onDragOver={e => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            onClick={() => fileRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${
              dragging
                ? 'border-cyan-400/60 bg-cyan-400/5'
                : 'border-white/10 hover:border-cyan-400/30 hover:bg-white/3'
            }`}
          >
            <input
              ref={fileRef}
              type="file"
              accept=".csv,.xlsx,.xls,.json"
              className="hidden"
              onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
            />
            <Upload size={28} className={`mx-auto mb-3 ${dragging ? 'text-cyan-400' : 'text-gray-500'}`} />
            <p className="font-bold text-sm">Перетащи файл или нажми для выбора</p>
            <p className="text-xs text-gray-500 mt-1">CSV · XLSX · JSON</p>
          </div>
        )}

        {/* Ошибка парсинга */}
        {parseErr && (
          <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/25 rounded-xl">
            <AlertCircle size={16} className="text-red-400 shrink-0" />
            <p className="text-sm text-red-300">{parseErr}</p>
            <button onClick={() => setParseErr('')} className="ml-auto text-red-400 hover:text-red-200 spring-btn">
              <X size={14} />
            </button>
          </div>
        )}

        {/* Превью строк */}
        {rows.length > 0 && (
          <>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold">{fileName}</p>
                <p className="text-[10px] text-gray-500 mt-0.5">
                  {rows.length} строк · {validRows.length} корректных
                </p>
              </div>
              <button
                onClick={() => { setRows([]); setFileName(''); setParseErr('') }}
                className="text-xs text-gray-500 hover:text-red-400 spring-btn flex items-center gap-1"
              >
                <X size={12} /> Очистить
              </button>
            </div>

            <div className="max-h-72 overflow-y-auto space-y-1.5 pr-1">
              {rows.map((row, i) => (
                <div key={row._key} className={`rounded-xl border px-3 py-2.5 ${
                  row._err ? 'border-red-500/25 bg-red-500/5' : 'border-white/6 bg-white/3'
                }`}>
                  {editIdx === i ? (
                    // Форма редактирования строки
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <input
                        className="col-span-2 bg-white/8 rounded-lg px-3 py-1.5 focus:outline-none input-glow"
                        value={row.description}
                        onChange={e => updateRow(row._key, { description: e.target.value })}
                        placeholder="Описание"
                      />
                      <input
                        type="number"
                        className="bg-white/8 rounded-lg px-3 py-1.5 focus:outline-none input-glow"
                        value={row.amount}
                        onChange={e => updateRow(row._key, { amount: Number(e.target.value), _err: Number(e.target.value) > 0 ? undefined : 'Нулевая сумма' })}
                        placeholder="Сумма"
                      />
                      <input
                        type="date"
                        className="bg-white/8 rounded-lg px-3 py-1.5 focus:outline-none input-glow"
                        style={{ colorScheme: 'dark' }}
                        value={row.date}
                        onChange={e => updateRow(row._key, { date: e.target.value })}
                      />
                      <select
                        className="bg-white/8 rounded-lg px-3 py-1.5 focus:outline-none"
                        value={row.type}
                        onChange={e => updateRow(row._key, { type: e.target.value as 'income' | 'expense' })}
                      >
                        <option value="expense">↓ Расход</option>
                        <option value="income">↑ Доход</option>
                      </select>
                      <select
                        className="bg-white/8 rounded-lg px-3 py-1.5 focus:outline-none"
                        value={row.category}
                        onChange={e => updateRow(row._key, { category: e.target.value })}
                      >
                        {CATS.map(c => <option key={c}>{c}</option>)}
                      </select>
                      <button
                        onClick={() => setEditIdx(null)}
                        className="col-span-2 py-1.5 bg-emerald-500/15 text-emerald-400 rounded-lg text-[10px] font-black uppercase tracking-wider hover:bg-emerald-500/25 spring-btn"
                      >
                        ✓ Готово
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <span className="text-base shrink-0">{catEmoji[row.category] ?? '💳'}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold truncate">{row.description}</p>
                        <p className="text-[10px] text-gray-500">{row.category} · {row.date}</p>
                        {row._err && <p className="text-[10px] text-red-400 font-bold mt-0.5">⚠ {row._err}</p>}
                      </div>
                      <span className={`text-sm font-black shrink-0 ${row.type === 'income' ? 'text-emerald-400' : 'text-red-400'}`}>
                        {row.type === 'income' ? '+' : '-'}{fmt(row.amount)}
                      </span>
                      <div className="flex gap-1 shrink-0">
                        <button
                          onClick={() => setEditIdx(editIdx === i ? null : i)}
                          className="w-7 h-7 rounded-lg bg-white/8 flex items-center justify-center text-gray-400 hover:text-cyan-400 spring-btn"
                        >
                          <Edit2 size={11} />
                        </button>
                        <button
                          onClick={() => removeRow(row._key)}
                          className="w-7 h-7 rounded-lg bg-red-500/10 flex items-center justify-center text-red-400 hover:bg-red-500/20 spring-btn"
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Итоговая строка */}
            <div className="flex items-center justify-between pt-2 border-t border-white/8">
              <div className="text-sm text-gray-400">
                Итого доходы: <span className="text-emerald-400 font-black">
                  +{fmt(validRows.filter(r => r.type === 'income').reduce((s, r) => s + r.amount, 0))}
                </span>
                {' · '}расходы: <span className="text-red-400 font-black">
                  -{fmt(validRows.filter(r => r.type === 'expense').reduce((s, r) => s + r.amount, 0))}
                </span>
              </div>
            </div>

            <button
              onClick={handleImport}
              disabled={!validRows.length || saving}
              className="w-full py-3.5 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-2xl font-black text-sm
                shadow-lg shadow-cyan-500/20 hover:scale-[1.02] spring-btn transition-all
                disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100
                flex items-center justify-center gap-2"
            >
              {saving ? (
                <><Loader2 size={16} className="animate-spin" /> Импорт {done}/{validRows.length}...</>
              ) : (
                <><Check size={16} /> Импортировать {validRows.length} транзакций</>
              )}
            </button>
          </>
        )}
      </div>
    </Modal>
  )
}
