import { addMonths, startOfMonth } from 'date-fns'
import { some } from 'fp-ts/Option'

import {
  Database,
  get_any,
  get_one,
  load_sql,
  where
} from '../utilities/db-utils'
import { SetRecord } from './types'

export const create_repository = (db: Database) => {
  const sql = load_sql('select_sets.sql')
  const one = get_one<SetRecord>(db, sql)
  const any = get_any<SetRecord>(db, sql)

  const by_id  = (id: number)  => one(where({ 'set.id': id }))
  const by_key = (key: string) => any(some({ 'set.exercise': key }))

  const topsets = load_sql('select_topsets.sql')
  const topten  = get_any<SetRecord>(db, topsets)
  const by_reps = (key: string, limit: number) => topten(
    some({ 'set.exercise': key }),
    some(limit)
  )

  return {
    by_id,
    by_key,
    by_query: any,
    by_reps
  }
}
