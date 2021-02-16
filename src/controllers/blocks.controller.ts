import { Database, where } from '../db-utils'
import { AsyncArray } from '../fp-utils'
import { 
  BlockRecord,
  QueryParams,
  create_blocks_repository
} from '../repositories'

export const create_controller = (db: Database) => {
  const repository = create_blocks_repository(db)

  const by_id = (workout_id: number): AsyncArray<BlockRecord> =>
    () => repository.by_ids([workout_id])

  const by_date = (date: Date): AsyncArray<BlockRecord> =>
    () => repository.by_date(date)

  const by_month = (date: Date): AsyncArray<BlockRecord> =>
    () => repository.by_month(date)

  const by_query = (params: QueryParams): AsyncArray<BlockRecord> =>
    () => repository.by_query(params)

  return {
    by_id,
    by_date,
    by_month,
    by_query
  }
}
