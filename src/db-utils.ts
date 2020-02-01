import { join } from 'path'

import { TaskEither, tryCatch } from 'fp-ts/lib/TaskEither'

import { ITask } from 'pg-promise'
import pg_promise = require('pg-promise')

const pgp = pg_promise({ capSQL: true })
const create_db = (url: string) => pgp(url)

export type Database = ReturnType<typeof create_db> | ITask<{}>

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

export const format = (clause: string, values: any) =>
  pgp.as.format(clause, values)