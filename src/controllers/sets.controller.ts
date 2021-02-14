import { addMonths, startOfMonth } from 'date-fns'
import { pipe } from 'fp-ts/lib/pipeable'
import { sequenceS } from 'fp-ts/lib/Apply'
import { Option, fold, toUndefined } from 'fp-ts/lib/Option'

import { Database, load_sql, format, where } from '../db-utils'
import { AsyncArray } from '../fp-utils'

type Clauses = {
  limit: Option<number>
  offset: Option<number>
  filter: Option<string>
}

export class SetsController {
  sql_select_sets = load_sql('select_sets.sql')

  constructor(private db: Database) {}

  private query = (filter: {
    where?: string
    limit?: number
    offset?: number
  }) => {
    const params = {
      where:  filter.where || '',
      limit:  filter.limit  ? `LIMIT ${filter.limit}` : '',
      offset: filter.offset ? `OFFSET ${filter.offset}` : ''
    }
    return this.db.any(this.sql_select_sets, params)
  }

  by_id = (set_id: number): AsyncArray<any> => () =>
    this.query({ where: where({ 'id': set_id }) })

  by_date = (date: Date): AsyncArray<any> => () =>
    this.query({ where: where({ 'workout_date': date }) })

  by_month = (date: Date): AsyncArray<any> => () => {
    const start  = startOfMonth(date)
    const end    = addMonths(start, 1)
    return this.query({
      where: where({ 'workout_date': { '>=': start, '<': end } })
    })
  }

  by_query = (query: Clauses): AsyncArray<any> => () =>
    pipe(
      {
        where:  pipe(query.filter, fold(() => undefined, a => build_where(a))),
        limit:  pipe(query.limit,  toUndefined),
        offset: pipe(query.offset, toUndefined),
      },
      params => this.query(params)
    )
}


const build_where = (filter: string) => {
  const date = new Date(2021, 1, 12);
  return where({ 'workout_date': date })
}