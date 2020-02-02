import { Database } from '../db-utils'
import { AsyncArray } from '../fp-utils'

export class CycleController {
  sql_select_by_id = 'SELECT * FROM awm.cycle WHERE awm.cycle.id = ${cycle_id}'

  constructor(private db: Database) {}

  get_all: AsyncArray<any> = () =>
    this.db.many('SELECT * FROM awm.cycle')

  get_by_id = (cycle_id: number): AsyncArray<any> => () =>
    this.db.any(this.sql_select_by_id, { cycle_id })
}
