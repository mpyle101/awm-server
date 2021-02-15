import { addMonths, startOfMonth } from 'date-fns'
import { pipe } from 'fp-ts/lib/pipeable'
import { sequenceS } from 'fp-ts/lib/Apply'
import { Option, fold } from 'fp-ts/lib/Option'

import { Database, load_sql, where } from '../db-utils'
import { AsyncArray } from '../fp-utils'
import { QueryParams } from './types'

export class WorkoutsController {
  sql_select_workouts = load_sql('select_workouts.sql')

  constructor(private db: Database) {}

  by_id = (set_id: number): AsyncArray<any> => () => {
    const filter = {
      where: where({ 'id': set_id }),
      limit: '',
      offset: ''
    }
    return this.db.any(this.sql_select_workouts, filter)
  }

  by_date = (date: Date): AsyncArray<any> => () => {
    const filter = {
      where: where({ 'workout_date': date }),
      limit: '',
      offset: ''
    }
    return this.db.any(this.sql_select_workouts, filter)
  }

  by_month = (date: Date): AsyncArray<any> => () => {
    const start  = startOfMonth(date)
    const end    = addMonths(start, 1)
    const filter = {
      where: where({'workout_date': { '>=': start, '<': end } }),
      limit: '',
      offset: ''
    }
    return this.db.any(this.sql_select_workouts, filter)
  }

  by_query = (query: QueryParams): AsyncArray<any> => () =>
    pipe(
      {
        where:  pipe(query.filter, fold(() => '', a => '')),
        limit:  pipe(query.limit,  fold(() => '', a => `LIMIT ${a}`)),
        offset: pipe(query.offset, fold(() => '', a => `OFFSET ${a}`)),
      },
      params => this.db.any(this.sql_select_workouts, params)
    )
}
