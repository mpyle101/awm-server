import { Database } from '../utilities/db-utils'
import { QueryParams, create_users_repository } from '../repositories'

export const create_controller = (db: Database) => {
  const repository = create_users_repository(db)
  const by_uname = ({
    username,
    password
  }: {
    username: string,
    password: string
  }) => repository.by_uname(username, password)

  return {
    by_uname
  }
}