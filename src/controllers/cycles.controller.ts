import { addMonths, startOfMonth } from 'date-fns'

import { Database, where } from '../db-utils'
import { AsyncArray } from '../fp-utils'
import {
  CycleRecord,
  QueryParams,
  create_cycles_repository
} from '../repositories'

export const create_controller = (db: Database) => {
  const repository = create_cycles_repository(db)

  const by_id = (set_id: number): AsyncArray<CycleRecord> =>
    () => repository.by_id(set_id)

  const by_month = (date: Date): AsyncArray<CycleRecord> =>
    () => repository.by_month(date)

  const by_query = (params: QueryParams): AsyncArray<CycleRecord> =>
    () => repository.by_query(params)

  return {
    by_id,
    by_month,
    by_query
  }
}