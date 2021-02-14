import { Database } from '../db-utils'
import { AsyncArray } from '../fp-utils'

export class ExercisesController {

  constructor(private db: Database) {}

  get_all: AsyncArray<any> = () =>
    this.db.many('SELECT * FROM awm.exercise')

  get_by_key = (key: string): AsyncArray<any> => () =>
    this.db.any('SELECT * FROM awm.exercise WHERE key = ${key}', { key })
}
