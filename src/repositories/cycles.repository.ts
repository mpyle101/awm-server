import { addMonths, startOfMonth } from 'date-fns'

import { Database, where } from '../db-utils'
import { create_base_repository } from './base.respository'
import { CycleRecord } from './types'

export const create_repository = (db: Database) => {
  const repository = create_base_repository(db, 'select_cycles.sql')

  const by_ids = (ids: number[]): Promise<CycleRecord[]> =>
    repository.query({ where: where({ 'cycle.id': { 'IN': ids } }) })

  const by_month = (date: Date): Promise<CycleRecord[]> => {
    const start = startOfMonth(date)
    const end   = addMonths(start, 1)
    return repository.query({
      where: where({ 'start_date': { '>=': start, '<': end } })
    })
  }

  const filter = (filter: Record<string, string>) => {
    const { name } = filter
    const clauses = { ...(name ? { name } : {}) }
    return Object.keys(clauses).length ? where(clauses) : ''
  }

  const by_query = repository.by_query<CycleRecord>(filter)

  return {
    by_ids,
    by_month,
    by_query
  }
}