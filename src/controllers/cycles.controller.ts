import { Database } from '../utilities/db-utils'
import { QueryParams, create_cycles_repository } from '../repositories'

export const create_controller = (db: Database) => {
  const repository = create_cycles_repository(db)
  const { by_id, by_month, by_query } = repository

  return {
    by_id,
    by_month,
    by_query: (params: QueryParams) =>
      by_query(params.filter, params.limit, params.offset)
  }
}