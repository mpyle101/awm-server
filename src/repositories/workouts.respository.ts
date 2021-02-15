import { addMonths, startOfMonth } from 'date-fns'

import { Database, where } from '../db-utils'
import { create_base_repository } from './base.respository'

export const create_repository = (db: Database) => {
  const repository = create_base_repository(db, 'select_workouts.sql')

  const by_id = (workout_id: number): Promise<any[]> =>
    repository.query({ where: where({ 'workout.id': workout_id }) })

  const by_date = (date: Date): Promise<any[]> =>
    repository.query({ where: where({ 'workout_date': date }) })

  const by_month = (date: Date): Promise<any[]> => {
    const start = startOfMonth(date)
    const end   = addMonths(start, 1)
    return repository.query({
      where: where({ 'workout_date': { '>=': start, '<': end } })
    })
  }

  return {
    by_id,
    by_date,
    by_month,
    by_query: repository.by_query(() => '')
  }
}
