import { Database } from '../db-utils'

export class ExerciseController {

  constructor(private db: Database) {}

  get_all = () =>
    this.db.many('SELECT * FROM awm.exercise')

  get_by_key = (key: string) =>
    this.db.any('SELECT * FROM awm.exercise WHERE key = ${key}', { key })
}
