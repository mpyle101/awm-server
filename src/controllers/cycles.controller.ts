import { Database } from '../utilities/db-utils'
import { QueryParams, create_cycles_repository } from '../repositories'

export const create_controller = (db: Database) => {
  const repository = create_cycles_repository(db)

  return {
    by_id:    (set_id: number) => repository.by_id(set_id),
    by_month: (date: Date) => repository.by_month(date),
    by_query: (params: QueryParams) =>
      repository.by_query(params.filter, params.limit, params.offset)
  }
}