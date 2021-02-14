import { join, resolve } from 'path'
import { ITask, QueryFile } from 'pg-promise'

import { pipe } from 'fp-ts/lib/pipeable'
import { sequenceS } from 'fp-ts/lib/Apply'

import { AsyncArray, numberFrom } from './fp-utils'

import * as E from 'fp-ts/lib/Either'
import * as O from 'fp-ts/lib/Option'

import pg_promise = require('pg-promise')
const pgp = pg_promise({ capSQL: true })

const create_db = (url: string) => pgp(url)
export type Database = ReturnType<typeof create_db>

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
    const params = is_simple(prop)
      ? [pgp.as.format(`$1:name ${prop === null ? 'IS NULL' : '= $2'}`, [key, prop])]
      : Object.entries(prop).map(([op, value]) =>
          pgp.as.format(`$1:name ${op} ${value === null ? 'NULL' : '$2'}`, [key, value]))

    return [...acc, ...params]
  }, [] as string[])

  return 'WHERE ' + conditions.join(and ? ' AND ' : ' OR ')
}

const is_simple = value =>
  typeof value === 'number' ||
  typeof value === 'string' ||
  typeof value === 'boolean' ||
  value instanceof Date ||
  value === null
