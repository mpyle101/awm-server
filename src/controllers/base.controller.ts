import { QueryFile } from 'pg-promise'
import { pipe } from 'fp-ts/lib/pipeable'
import { fold, toUndefined } from 'fp-ts/lib/Option'

import { Database, load_sql, where } from '../db-utils'
import { AsyncArray } from '../fp-utils'
import { QueryParams } from './types'

export abstract class BaseController {
  private sql_query: QueryFile

  constructor(
    private db: Database,
    sql_filename: string
  ) {
    this.sql_query = load_sql(sql_filename)
  }

  abstract handle_filter(filter: Record<string, string>): string

  query = (filter: {
    where?: string
    limit?: number
    offset?: number
  }) => {
    const params = {
      where:  filter.where || '',
      limit:  filter.limit  ? `LIMIT ${filter.limit}` : '',
      offset: filter.offset ? `OFFSET ${filter.offset}` : ''
    }
    return this.db.any(this.sql_query, params)
  }

  by_query = (query: QueryParams): AsyncArray<any> => () =>
    pipe(
      {
        where:  pipe(query.filter, fold(
          () => undefined,
          a  => this.handle_filter(a))
        ),
        limit:  pipe(query.limit,  toUndefined),
        offset: pipe(query.offset, toUndefined)
      },
      params => this.query(params)
    )
}
