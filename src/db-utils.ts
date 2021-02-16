import { join, resolve } from 'path'
import { IDatabase } from 'pg-promise'
import { pipe } from 'fp-ts/lib/pipeable'
import { sequenceS } from 'fp-ts/lib/Apply'

import { AsyncArray } from './fp-utils'

import pg_promise = require('pg-promise')
const pgp = pg_promise({ capSQL: true })

const create_db = (url: string) => pgp(url)

export type Database = IDatabase<any>
export const format = pgp.as.format

export const connect = async (url: string) => {
  /** Make a test connection and release it */
  const db = create_db(url)
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

const is_simple = value =>
  typeof value === 'number' ||
  typeof value === 'string' ||
  typeof value === 'boolean' ||
  value instanceof Date ||
  value === null
