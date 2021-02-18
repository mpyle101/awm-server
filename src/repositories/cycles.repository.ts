import { addMonths, startOfMonth } from 'date-fns'
import { some } from 'fp-ts/lib/Option'

import {
  Database,
  get_any,
  get_one,
  load_sql,
  where
} from '../db-utils'
import { CycleRecord } from './types'

export const create_repository = (db: Database) => {
  const sql = load_sql('select_cycles.sql')
  const filter = (filter: Record<string, string>) => {
    const { name } = filter
    const clauses = { ...(name ? { name } : {}) }
    return Object.keys(clauses).length ? where(clauses) : ''
  }

  const one = get_one<CycleRecord>(db, sql)
  const any = get_any<CycleRecord>(db, sql, filter)

  const by_id    = (id: number) => one(where({ 'cycle.id': id }))
  const by_ids   = (ids: number[]) => any(some({ 'cycle.id': { 'IN': ids } }))
  const by_month = (date: Date) => {
    const start = startOfMonth(date)
    const end = addMonths(start, 1)
    return any(some({ 'workout_date': { '>=': start, '<': end } }))
  }

  return {
    by_id,
    by_ids,
    by_month,
    by_query: any
  }
}