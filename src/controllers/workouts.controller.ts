import { Database } from '../utilities/db-utils'
import { QueryParams, create_workouts_repository } from '../repositories'

export const create_controller = (db: Database) => {
  const repository = create_workouts_repository(db)
  const { by_id, by_date, by_month, by_query } = repository

  return {
    by_id,
    by_date,
    by_month,
    by_query: (params: QueryParams) =>
      by_query(params.filter, params.limit, params.offset)
  }
}
