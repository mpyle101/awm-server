import { addMonths, startOfMonth } from 'date-fns'

import { Database, where } from '../db-utils'
import { create_base_repository } from './base.respository'
import { SetRecord } from './types'

export const create_repository = (db: Database) => {
  const repository = create_base_repository(db, 'select_sets.sql')

  const by_id = (set_id: number): Promise<SetRecord[]> =>
    repository.query({ where: where({ 'set.id': set_id }) })

  const by_date = (date: Date): Promise<SetRecord[]> =>
    repository.query({ where: where({ 'workout_date': date }) })

  const by_month = (date: Date): Promise<SetRecord[]> => {
    const start = startOfMonth(date)
    const end   = addMonths(start, 1)
    return repository.query({
      where: where({ 'workout_date': { '>=': start, '<': end } })
    })
  }

  const filter = (filter: Record<string, string>) => {
    const date = new Date(2021, 1, 12);
    return where({ 'workout_date': date })
  }

  return {
    by_id,
    by_date,
    by_month,
    by_query: repository.by_query<SetRecord>(filter)
  }
}


