import { addMonths, startOfMonth } from 'date-fns'

import { Database, where } from '../db-utils'
import { create_base_repository } from './base.respository'
import { BlockRecord } from './types'

export const create_repository = (db: Database) => {
  const repository = create_base_repository(db, 'select_blocks.sql')

  const by_ids = (ids: number[]): Promise<BlockRecord[]> =>
    repository.query({ where: where({ 'block.id': { 'IN': ids } }) })

  const by_date = (date: Date): Promise<BlockRecord[]> =>
    repository.query({ where: where({ 'workout_date': date }) })

  const by_month = (date: Date): Promise<BlockRecord[]> => {
    const start = startOfMonth(date)
    const end   = addMonths(start, 1)
    return repository.query({
      where: where({ 'workout_date': { '>=': start, '<': end } })
    })
  }

  const by_query = repository.by_query<BlockRecord>(() => '')

  return {
    by_ids,
    by_date,
    by_month,
    by_query
  }
}
