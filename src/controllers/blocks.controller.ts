import { Database } from '../utilities/db-utils'
import { QueryParams, create_blocks_repository } from '../repositories'

export const create_controller = (db: Database) => {
  const repository = create_blocks_repository(db)
  const { by_id, by_date, by_month, by_query } = repository

  return {
    by_id,
    by_date,
    by_month,
    by_query: (params: QueryParams) =>
      by_query(params.filter, params.limit, params.offset)
  }
}