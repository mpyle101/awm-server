import {
  Database,
  get_one_with,
  load_sql,
  where
} from '../utilities/db-utils'
import { UserRecord } from './types'

export const create_repository = (db: Database) => {
  const sql = load_sql('select_user.sql')
  const one = get_one_with<UserRecord>(db, sql)

  return {
    by_uname: (username: string, password: string) =>
      one({ username, password })
  }
}
