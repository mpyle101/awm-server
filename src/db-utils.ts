import { join } from 'path'

import { TaskEither, tryCatch } from 'fp-ts/lib/TaskEither'

import { ITask } from 'pg-promise'
import pg_promise = require('pg-promise')

const pgp = pg_promise({ capSQL: true })

export type Database = ReturnType<typeof pgp> | ITask<{}>

export const connect = async (url: string) => {
  /** Make a test connection and release it */
  const db = pgp(url)
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
