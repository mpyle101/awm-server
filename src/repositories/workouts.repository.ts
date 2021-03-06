import { addMonths, startOfMonth } from 'date-fns'
import { some } from 'fp-ts/Option'

import {
  Database,
  get_any,
  get_one,
  load_sql,
  where
} from '../utilities/db-utils'
import { WorkoutRecord } from './types'

export const create_repository = (db: Database) => {
  const sql = load_sql('select_workouts.sql')
  const one = get_one<WorkoutRecord>(db, sql)
  const any = get_any<WorkoutRecord>(db, sql)

  const by_id    = (id: number) => one(where({ 'workout.id': id }))
  const by_ids   = (ids: number[]) => any(some({ 'workout.id': { 'IN': ids } }))
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