import { Database, where } from '../db-utils'
import { AsyncArray } from '../fp-utils'
import {
  SetRecord,
  QueryParams,
  create_sets_repository
} from '../repositories'

export const create_controller = (db: Database) => {
  const repository = create_sets_repository(db)

  const by_id = (set_id: number): AsyncArray<SetRecord> =>
    () => repository.by_ids([set_id])

  const by_date = (date: Date): AsyncArray<SetRecord> =>
    () => repository.by_date(date)

  const by_month = (date: Date): AsyncArray<SetRecord> =>
    () => repository.by_month(date)

  const by_query = (params: QueryParams): AsyncArray<any> =>
    () => repository.by_query(params)

  return {
    by_id,
    by_date,
    by_month,
    by_query
  }
}


