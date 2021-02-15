import { addMonths, startOfMonth } from 'date-fns'

import { Database, where } from '../db-utils'
import { create_base_repository } from './base.respository'
import { CycleRecord } from './types'

export const create_repository = (db: Database) => {
  const repository = create_base_repository(db, 'select_cycles.sql')

  const by_id = (set_id: number): Promise<CycleRecord[]> =>
    repository.query({ where: where({ 'id': set_id }) })

  const by_month = (date: Date): Promise<CycleRecord[]> => {
    const start = startOfMonth(date)
    const end   = addMonths(start, 1)
    return repository.query({
      where: where({ 'workout_date': { '>=': start, '<': end } })
    })
  }

  const filter = (filter: Record<string, string>) => {
    const { name } = filter
    const clauses = {
      ...(name ? { name } : {})
    }
    return Object.keys(clauses).length ? where(clauses) : ''
  }

  return {
    by_id,
    by_month,
    by_query: repository.by_query<CycleRecord>(filter)
  }
}