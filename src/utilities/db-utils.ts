import { join, resolve } from 'path'
import { IDatabase, QueryFile } from 'pg-promise'

import { pipe } from 'fp-ts/pipeable'
import { Option } from 'fp-ts/Option'
import * as E from 'fp-ts/Either'
import * as O from 'fp-ts/Option'
import * as T from 'fp-ts/Task'
import * as TE from 'fp-ts/TaskEither'

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

export const connect = (url: string) => {
  /** Make a test connection and release it **/
  const db = pgp(url)
  return pipe(
    TE.tryCatch(
      () => db.connect(),
      E.toError
    ),
    TE.map(dbc => ({ dbc, version: dbc.client.serverVersion })),
    TE.map(({ dbc, version }) => { dbc.done(); return version }),
    TE.map(version => ({ db, version }))
  )
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

export const get_one = <T>(
  db: Database,
  sql: string | QueryFile
) => (
  where = ''
) => pipe(
  TE.tryCatch(
    () => db.oneOrNone<T>(sql, { limit: '', offset: '', where }),
    E.toError
  ),
  TE.map(O.fromNullable)
)

export const get_any = <T>(
  db: Database,
  sql: string | QueryFile,
  handler: FilterHandler = (obj: object) => where(obj)
) => (
  filter: Option<Record<string, any>> = O.none,
  limit:  Option<number> = O.none,
  offset: Option<number> = O.none
) => pipe(
  { limit, offset, filter },
  get_filters(handler),
  filter => TE.tryCatch(
    () => db.any<T>(sql, filter),
    E.toError
  )
)

const get_filters = (handler: FilterHandler) =>
  (params: FilterParams): FilterStrings =>
({
  where:  pipe(params.filter, O.fold(() => '', handler)),
  limit:  pipe(params.limit,  O.fold(() => '', v => `LIMIT ${v}`)),
  offset: pipe(params.offset, O.fold(() => '', v => `OFFSET ${v}`)),
})
