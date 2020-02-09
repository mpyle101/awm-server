import { join } from 'path'
import { ITask, QueryFile } from 'pg-promise'

import { pipe } from 'fp-ts/lib/pipeable'
import { sequenceS } from 'fp-ts/lib/Apply'

import { AsyncArray, numberFrom } from './fp-utils'

import * as E from 'fp-ts/lib/Either'
import * as O from 'fp-ts/lib/Option'

import pg_promise = require('pg-promise')
const pgp = pg_promise({ capSQL: true })

const create_db = (url: string) => pgp(url)
export type Database = ReturnType<typeof create_db> | ITask<{}>

export const format = pgp.as.format

export const connect = async (url: string) => {
  /** Make a test connection and release it */
  const db = create_db(url)
  try {
    const dbc = await db.connect()
    const version = dbc.client.serverVersion
    dbc.done()
    return Promise.resolve({ db, version })
  } catch (e) {
    return Promise.reject(e)
  }
}

export const load_sql = (fname: string) => {
  const path = join(__dirname, 'sql', fname)
  return new pgp.QueryFile(path, { minify: true })
}

export const where = (values: object, and=true) => {
  const conditions = Object.entries(values).reduce((acc, [key, prop]) => {
    if (is_simple(prop)) {
      acc.push(pgp.as.format('$(key:raw) = $(prop)', { key, prop }))
    } else {
      Object.entries(prop).forEach(([op, value]) =>
        acc.push(pgp.as.format(`$(key:raw) ${op} $(value)`, { key, value }))
      )
    }
    return acc
  }, [] as string[])

  return 'WHERE ' + conditions.join(and ? ' AND ' : ' OR ')
}

const is_simple = value =>
  typeof value === 'number' ||
  typeof value === 'string' ||
  typeof value === 'boolean' ||
  value instanceof Date ||
  value === null
