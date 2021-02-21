import { Database } from '../utilities/db-utils'
import { QueryParams, create_sets_repository } from '../repositories'

export const create_controller = (db: Database) => {
  const repository = create_sets_repository(db)
  const { by_id, by_key, by_query, by_reps } = repository

  return {
    by_id,
    by_key,
    by_reps,
    by_query: (params: QueryParams) =>
      by_query(params.filter, params.limit, params.offset)
  }
}


