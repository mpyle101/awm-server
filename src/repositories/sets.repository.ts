import { addMonths, startOfMonth } from 'date-fns'
import { pipe } from 'fp-ts/function'
import { some } from 'fp-ts/Option'
import { map, sequenceArray } from 'fp-ts/TaskEither'

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

  const top_sql = load_sql('select_topsets.sql')
  const top_set = get_any<SetRecord>(db, top_sql)
  const by_reps = (key: string, reps: number) => 
    pipe(
      [...Array(reps).keys()].map(k =>
        top_set(some({ 'set.exercise': key, 'set.reps': { '>=': k + 1 } }))
      ),
      sequenceArray,
      map(recs => recs.reduce((reps, set, idx) => {
        reps[idx + 1] = set[0]
        return reps
      }, {}))
    )

  return {
    by_id,
    by_key,
    by_query: any,
    by_reps
  }
}
