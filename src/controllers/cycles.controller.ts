import { addMonths, startOfMonth } from 'date-fns'

import { Database, where } from '../db-utils'
import { AsyncArray } from '../fp-utils'

import { BaseController } from './base.controller'

export class CyclesController extends BaseController {

  constructor(db: Database) {
    super(db, 'select_cycles.sql')
  }

  by_id = (cycle_id: number): AsyncArray<any> => () =>
    this.query({ where: where({ 'id': cycle_id }) })

  by_month = (date: Date): AsyncArray<any> => () => {
    const start = startOfMonth(date)
    const end   = addMonths(start, 1)
    return this.query({
      where: where({ 'start_date': { '>=': start, '<': end } })
    })
  }

  handle_filter = (filter: Record<string, string>) => {
    const { name } = filter
    const clauses = {
      ...(name ? { name } : {})
    }
    return Object.keys(clauses).length ? where(clauses) : ''
  }
}