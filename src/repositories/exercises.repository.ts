import { some } from 'fp-ts/Option'
import {
  Database,
  get_any,
  get_one,
  load_sql,
  where
} from '../utilities/db-utils'
import { ExerciseRecord } from './types'

export const create_repository = (db: Database) => {
  const sql = load_sql('select_exercises.sql')

  const filter = (filter: Record<string, string>) => {
    const { key, name } = filter
    const clauses = {
      ...(key ? { key } : {}),
      ...(name ? { name } : {})
    }
    return Object.keys(clauses).length ? where(clauses) : ''
  }

  const one = get_one<ExerciseRecord>(db, sql)

  return {
    by_key: (key: string) => one(where({ key })),
    by_query: get_any<ExerciseRecord>(db, sql, filter)
  }
}
