import { join, resolve } from 'path'
import { IDatabase, QueryFile } from 'pg-promise'

import { pipe } from 'fp-ts/lib/pipeable'
import { Option } from 'fp-ts/lib/Option'
import * as E from 'fp-ts/lib/Either'
import * as O from 'fp-ts/lib/Option'
import * as TE from 'fp-ts/lib/TaskEither'

import pg_promise = require('pg-promise')
const pgp = pg_promise({ capSQL: true })

export type Database = IDatabase<any>
export const format = pgp.as.format

type FilterParams = {
  limit:  Option<number>
  offset: Option<number>
  filter: Option<Record<string, any>>
}

type FilterStrings = {
  where:  string
  limit:  string
  offset: string
}

type FilterHandler = (filter: Record<string, string>) => string;


const is_simple = value =>
  typeof value === 'number' ||
  typeof value === 'string' ||
  typeof value === 'boolean' ||
  value instanceof Date ||
  value === null


export const connect = async (url: string) => {
  /** Make a test connection and release it **/
  const db  = pgp(url)
  const dbc = await db.connect()
  const version = dbc.client.serverVersion
  dbc.done()

  return { db, version }
}

export const load_sql = (fname: string) => {
  const path = resolve(join('sql', fname))
  return new pgp.QueryFile(path, { minify: true })
}

export const where = (values: object, and=true) => {
  const conditions = Object.entries(values).reduce((acc, [key, prop]) => {
    let params: string[]

    if (is_simple(prop)) {
      params = [format(`$1:alias ${prop === null ? 'IS NULL' : '= $2'}`, [key, prop])]
    } else if (Array.isArray(prop)) {
      params = [format('$1:alias IN ($2:list)', [key, prop])]
    } else {
      params = Object.entries(prop).map(([op, value]) => {
        const fmt = (op === 'IN' || op === 'NOT IN') ? '($2:list)' : '$2'
        return format(
          `$1:alias ${op} ${value === null ? 'NULL' : fmt}`,
          [key, value]
        )
      })
    }

    return acc.concat(params)
  }, [] as string[])

  return 'WHERE ' + conditions.join(and ? ' AND ' : ' OR ')
}

export const get_one = <T>(db: Database, sql: string | QueryFile) =>
  (where = ''): TE.TaskEither<Error, Option<T>> =>
    pipe(
      TE.tryCatch(
        () => db.any<T>(sql, { limit: '', offset: '', where }),
        E.toError
      ),
      TE.map(recs => recs.length ? O.some(recs[0]) : O.none)
    )

export const get_any = <T>(
  db: Database,
  sql: string | QueryFile,
  handler: FilterHandler = () => ''
) => (
  filter: Option<Record<string, any>> = O.none,
  limit:  Option<number> = O.none,
  offset: Option<number> = O.none
): TE.TaskEither<Error, T[]> => 
  pipe(
    { limit, offset, filter },
    get_filter(handler),
    filter => TE.tryCatch(
      () => db.any<T>(sql, filter),
      E.toError
    )
  )

const get_filter = (handler: FilterHandler) =>
  ( params: FilterParams ): FilterStrings =>
({
  where: pipe(
    params.filter,
    O.fold(
      () => '',
      v  => handler(v)
    )
  ),
  limit:  pipe(params.limit,  O.fold(() => '', v => `LIMIT ${v}`)),
  offset: pipe(params.offset, O.fold(() => '', v => `OFFSET ${v}`)),
})
