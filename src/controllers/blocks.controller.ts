import { addMonths, startOfMonth } from 'date-fns'

import { Database, where } from '../db-utils'
import { AsyncArray } from '../fp-utils'

import { create_base_controller } from './base.controller'

export const create_controller = (db: Database) => {
  const controller = create_base_controller(db, 'select_blocks.sql')

  const by_id = (workout_id: number): AsyncArray<any> => () =>
    controller.query({ where: where({ 'block.id': workout_id }) })

  const by_date = (date: Date): AsyncArray<any> => () =>
    controller.query({ where: where({ 'workout_date': date }) })

  const by_month = (date: Date): AsyncArray<any> => () => {
    const start = startOfMonth(date)
    const end   = addMonths(start, 1)
    return controller.query({
      where: where({ 'workout_date': { '>=': start, '<': end } })
    })
  }

  return {
    by_id,
    by_date,
    by_month,
    by_query: controller.by_query(() => '')
  }
}
