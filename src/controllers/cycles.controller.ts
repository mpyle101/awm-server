import { addMonths, startOfMonth } from 'date-fns'

import { Database, where } from '../db-utils'
import { AsyncArray } from '../fp-utils'

import { create_base_controller } from './base.controller'
import { CycleRecord } from './types'

export const create_controller = (db: Database) => {
  const controller = create_base_controller(db, 'select_cycles.sql')

  const by_id = (set_id: number): AsyncArray<CycleRecord> => () =>
    controller.query({ where: where({ 'id': set_id }) })

  const by_month = (date: Date): AsyncArray<CycleRecord> => () => {
    const start = startOfMonth(date)
    const end   = addMonths(start, 1)
    return controller.query({
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
    by_query: controller.by_query<CycleRecord>(filter)
  }
}