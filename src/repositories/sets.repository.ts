import { addMonths, startOfMonth } from 'date-fns'
import { some } from 'fp-ts/lib/Option'

import {
  Database,
  get_any,
  get_one,
  load_sql,
  where
} from '../db-utils'
import { SetRecord } from './types'

export const create_repository = (db: Database) => {
  const sql = load_sql('select_sets.sql')
  const one = get_one<SetRecord>(db, sql)
  const any = get_any<SetRecord>(db, sql, filter => where(filter))

  const by_id    = (id: number) => one(where({ 'set.id': id }))
  const by_ids   = (ids: number[]) => any(some({ 'set.id': { 'IN':ids } })) 
  const by_date  = (date: Date) => any(some({ 'workout_date': date }))
  const by_month = (date: Date) => {
    const start = startOfMonth(date)
    const end   = addMonths(start, 1)
    return any(some({ 'workout_date': { '>=': start, '<': end } }))
  }

  return {
    by_id,
    by_ids,
    by_date,
    by_month,
    by_query: any
  }
}
