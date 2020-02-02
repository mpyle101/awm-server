import { addMonths, startOfMonth } from 'date-fns'
import { Database, load_sql, where } from '../db-utils'
import { AsyncArray } from '../fp-utils'

export class WorkoutController {
  sql_select_sets = load_sql('select_sets_raw.sql')

  constructor(private db: Database) {}

  get_all: AsyncArray<any> = () => this.db.any(this.sql_select_sets, '')

  get_by_id = (workout_id: number): AsyncArray<any> => () => {
    const clause = where({ 'awm.workout.id': workout_id })
    return this.db.any(this.sql_select_sets, clause)
  }

  get_by_date = (date: Date): AsyncArray<any> => () => {
    const clause = where({ 'awm.workout.workout_date': date })
    return this.db.any(this.sql_select_sets, clause)
  }

  get_by_month = (date: Date): AsyncArray<any> => () => {
    const start  = startOfMonth(date)
    const end    = addMonths(start, 1)
    const clause = where({'awm.workout.workout_date': { '>=': start, '<': end } })
    return this.db.any(this.sql_select_sets, clause)
  }
}
