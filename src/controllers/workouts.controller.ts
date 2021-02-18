import { Database } from '../db-utils'
import { QueryParams, create_workouts_repository } from '../repositories'

export const create_controller = (db: Database) => {
  const repository = create_workouts_repository(db)

  return {
    by_id:    (set_id: number) => repository.by_id(set_id),
    by_date:  (date: Date) => repository.by_date(date),
    by_month: (date: Date) => repository.by_month(date),
    by_query: (params: QueryParams) =>
      repository.by_query(params.filter, params.limit, params.offset)
  }
}
