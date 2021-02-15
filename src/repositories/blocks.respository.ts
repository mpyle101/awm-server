import { addMonths, startOfMonth } from 'date-fns'

import { Database, where } from '../db-utils'
import { create_base_repository } from './base.respository'

export const create_repository = (db: Database) => {
  const respository = create_base_repository(db, 'select_blocks.sql')

  const by_id = (workout_id: number): Promise<any[]> =>
    respository.query({ where: where({ 'block.id': workout_id }) })

  const by_date = (date: Date): Promise<any[]> =>
    respository.query({ where: where({ 'workout_date': date }) })

  const by_month = (date: Date): Promise<any[]> => {
    const start = startOfMonth(date)
    const end   = addMonths(start, 1)
    return respository.query({
      where: where({ 'workout_date': { '>=': start, '<': end } })
    })
  }

  return {
    by_id,
    by_date,
    by_month,
    by_query: respository.by_query(() => '')
  }
}
