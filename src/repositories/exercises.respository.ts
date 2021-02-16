import { Database, where } from '../db-utils'
import { create_base_repository } from './base.respository'
import { ExerciseRecord } from './types'

export const create_repository = (db: Database) => {
  const repository = create_base_repository(db, 'select_exercises.sql')

  const by_key = (key: string): Promise<ExerciseRecord[]> =>
    repository.query({ where: where({ key }) })

  const filter = (filter: Record<string, string>) => {
    const { key, name } = filter
    const clauses = {
      ...(key ? { key } : {}),
      ...(name ? { name } : {})
    }
    return Object.keys(clauses).length ? where(clauses) : ''
  }

  const by_query = repository.by_query<ExerciseRecord>(filter)

  return {
    by_key,
    by_query
  }
}
