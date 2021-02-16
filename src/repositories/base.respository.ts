import { QueryFile } from 'pg-promise'
import { pipe } from 'fp-ts/lib/pipeable'
import { fold, toUndefined } from 'fp-ts/lib/Option'

import { Database, load_sql, where } from '../db-utils'
import { QueryParams } from './types'

type handler = (filter: Record<string, string>) => string;

export const create_base_repository = (db: Database, sql_filename: string) => {
  const sql = load_sql(sql_filename)

  const query = <T=any>(filter: {
    where?: string
    limit?: number
    offset?: number
  }): Promise<T[]> => {
    const params = {
      where:  filter.where || '',
      limit:  filter.limit  ? `LIMIT ${filter.limit}`   : '',
      offset: filter.offset ? `OFFSET ${filter.offset}` : ''
    }

    return db.any<T>(sql, params)
  }

  const by_query = <T=any>(filter_handler: handler) =>
    (params: QueryParams): Promise<T[]> =>
      pipe(
        {
          where: pipe(params.filter, fold(
            () => undefined,
            a  => filter_handler(a))
          ),
          limit:  pipe(params.limit,  toUndefined),
          offset: pipe(params.offset, toUndefined)
        },
        filter => query<T>(filter)
      )

  return {
    by_query,
    query
  }
}

