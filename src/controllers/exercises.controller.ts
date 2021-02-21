import { Database } from '../utilities/db-utils'
import { QueryParams, create_exercises_repository } from '../repositories'

export const create_controller = (db: Database) => {
  const repository = create_exercises_repository(db)
  const { by_key, by_query } = repository

  return {
    by_key,
    by_query: (params: QueryParams) =>
      by_query(params.filter, params.limit, params.offset)
  }
}