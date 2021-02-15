import { Database, where } from '../db-utils'
import { AsyncArray } from '../fp-utils'
import {
  ExerciseRecord,
  QueryParams,
  create_exercises_repository
} from '../repositories'

export const create_controller = (db: Database) => {
  const repository = create_exercises_repository(db)

  const by_key = (key: string): AsyncArray<ExerciseRecord> =>
    () => repository.by_key(key)

  const by_query = (params: QueryParams): AsyncArray<any> =>
    () => repository.by_query(params)

  return {
    by_key,
    by_query
  }
}
