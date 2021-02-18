import { Database } from '../db-utils'
import { QueryParams, create_exercises_repository } from '../repositories'

export const create_controller = (db: Database) => {
  const repository = create_exercises_repository(db)

  return {
    by_key:   (key: string) => repository.by_key(key),
    by_query: (params: QueryParams) =>
      repository.by_query(params.filter, params.limit, params.offset)
  }
}