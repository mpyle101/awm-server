import { addMonths, startOfMonth } from 'date-fns'
import { Database, format, load_sql } from '../db-utils'

export class WorkoutsController {
  sql_select_sets = load_sql('select_sets_raw.sql')

  constructor(private db: Database) {}

  get_by_id = (workout_id: number) => {
    const where = format('WHERE awm.workout.id = ${workout_id}', { workout_id })
    return this.db.any(this.sql_select_sets, where)
  }

  get_by_date = (date: Date) => {
    const where = format('WHERE awm.workout.workout_date = ${date}', { date })
    return this.db.any(this.sql_select_sets, where)
  }

  get_by_month = (date: Date) => {
    const start = startOfMonth(date)
    const end   = addMonths(start, 1)
    console.log(start, end)
    const where = format(
      'WHERE awm.workout.workout_date >= ${start} AND awm.workout.workout_date < ${end}',
      { start, end }
    )
    return this.db.any(this.sql_select_sets, where)
  }
}
