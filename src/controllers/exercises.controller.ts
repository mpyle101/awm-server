import { Database, where } from '../db-utils'
import { AsyncArray } from '../fp-utils'

import { create_base_controller } from './base.controller'
import { ExerciseRecord } from './types'

export const create_controller = (db: Database) => {
  const controller = create_base_controller(db, 'select_exercises.sql')

  const by_key = (key: string): AsyncArray<ExerciseRecord> => () =>
    controller.query({ where: where({ key }) })

  const filter = (filter: Record<string, string>) => {
    const { key, name } = filter
    const clauses = {
      ...(key ? { key } : {}),
      ...(name ? { name } : {})
    }
    return Object.keys(clauses).length ? where(clauses) : ''
  }

  return {
    by_key,
    by_query: controller.by_query<ExerciseRecord>(filter)
  }
}
