import { addMonths, startOfMonth } from 'date-fns'

import { Database, where } from '../db-utils'
import { AsyncArray } from '../fp-utils'

import { create_base_controller } from './base.controller'
import { SetRecord } from './types'

export const create_controller = (db: Database) => {
  const controller = create_base_controller(db, 'select_sets.sql')

  const by_id = (set_id: number): AsyncArray<SetRecord> => () =>
    controller.query({ where: where({ 'set.id': set_id }) })

  const by_date = (date: Date): AsyncArray<SetRecord> => () =>
    controller.query({ where: where({ 'workout_date': date }) })

  const by_month = (date: Date): AsyncArray<SetRecord> => () => {
    const start = startOfMonth(date)
    const end   = addMonths(start, 1)
    return controller.query({
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
    by_query: controller.by_query<SetRecord>(filter)
  }
}


