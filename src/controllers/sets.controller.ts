import { pipe } from 'fp-ts/function'
import { fold, map } from 'fp-ts/TaskEither'

import { Database } from '../utilities/db-utils'
import { rethrow } from '../utilities/fp-utils'
import { QueryParams, SetRecord, create_sets_repository } from '../repositories'

export const create_controller = (db: Database) => {
  const repository = create_sets_repository(db)
  const { by_id, by_key, by_query } = repository

  const by_reps = (key: string, reps: number) =>repository.by_reps(key, reps)

  return {
    by_id,
    by_key,
    by_reps,
    by_query: (params: QueryParams) =>
      by_query(params.filter, params.limit, params.offset)
  }
}
