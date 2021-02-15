import { addMonths, startOfMonth } from 'date-fns'

import { Database, where } from '../db-utils'
import { AsyncArray } from '../fp-utils'

import { BaseController } from './base.controller'

const EMPTY_STRING = ''

export class BlocksController extends BaseController {

  constructor(db: Database) {
    super(db, 'select_blocks.sql')
  }

  by_id = (block_id: number): AsyncArray<any> => () =>
    this.query({ where: where({ 'id': block_id }) })

  by_date = (date: Date): AsyncArray<any> => () =>
    this.query({ where: where({ 'workout_date': date }) })

  by_month = (date: Date): AsyncArray<any> => () => {
    const start = startOfMonth(date)
    const end   = addMonths(start, 1)
    return this.query({
      where: where({ 'workout_date': { '>=': start, '<': end } })
    })
  }

  handle_filter = (filter: Record<string, string>) => EMPTY_STRING
}
