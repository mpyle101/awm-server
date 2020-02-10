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

export class SetController {
  sql_select_sets = load_sql('select_sets.sql')

  constructor(private db: Database) {}

  by_id = (set_id: number): AsyncArray<any> => () => {
    const filter = {
      where: where({ 'awm.set.id': set_id }),
      limit: '',
      offset: ''
    }
    return this.db.any(this.sql_select_sets, filter)
  }

  by_date = (date: Date): AsyncArray<any> => () => {
    const filter = {
      where: where({ 'awm.workout.workout_date': date }),
      limit: '',
      offset: ''
    }
    return this.db.any(this.sql_select_sets, filter)
  }

  by_month = (date: Date): AsyncArray<any> => () => {
    const start  = startOfMonth(date)
    const end    = addMonths(start, 1)
    const filter = {
      where: where({'awm.workout.workout_date': { '>=': start, '<': end } }),
      limit: '',
      offset: ''
    }
    return this.db.any(this.sql_select_sets, filter)
  }

  by_query = (query: Clauses): AsyncArray<any> => () =>
    pipe(
      {
        where:  pipe(query.filter, getOrElse(() => '')),
        limit:  pipe(query.limit,  fold(() => '', a => `LIMIT ${a}`)),
        offset: pipe(query.offset, fold(() => '', a => `OFFSET ${a}`)),
      },
      params => this.db.any(this.sql_select_sets, params)
    )
}
