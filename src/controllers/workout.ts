import { addMonths, startOfMonth } from 'date-fns'
import { pipe } from 'fp-ts/lib/pipeable'
import { sequenceS } from 'fp-ts/lib/Apply'
import { Option, option, fold, getOrElse } from 'fp-ts/lib/Option'

import { Database, load_sql, format, where } from '../db-utils'
import { AsyncArray } from '../fp-utils'

type Clauses = {
  limit: Option<number>
  offset: Option<number>
  filter: Option<string>
}

export class WorkoutController {
  sql_select_workouts = load_sql('select_workouts.sql')

  constructor(private db: Database) {}

  by_id = (workout_id: number): AsyncArray<any> => () => {
    const filter = where({ 'awm.workout.id': workout_id })
    return this.any(filter)
  }

  by_date = (date: Date): AsyncArray<any> => () => {
    const filter = where({ 'awm.workout.workout_date': date })
    return this.any(filter)
  }

  by_month = (date: Date): AsyncArray<any> => () => {
    const start  = startOfMonth(date)
    const end    = addMonths(start, 1)
    const filter = where({'awm.workout.workout_date': { '>=': start, '<': end } })
    return this.any(filter)
  }

  by_query = (query: Clauses): AsyncArray<any> => () =>
    pipe(
      {
        where:  pipe(query.filter, getOrElse(() => '')),
        limit:  pipe(query.limit,  fold(() => '', a => `LIMIT ${a}`)),
        offset: pipe(query.offset, fold(() => '', a => `OFFSET ${a}`)),
      },
      params => this.db.any(this.sql_select_workouts, params)
    )

  private any = (where = '', limit = '', offset = '') =>
    this.db.any(this.sql_select_workouts, { where, limit, offset })
}
