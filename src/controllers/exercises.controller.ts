import { Database, where } from '../db-utils'
import { AsyncArray } from '../fp-utils'

import { BaseController } from './base.controller'

export class ExercisesController extends BaseController{

  constructor(db: Database) {
    super(db, 'select_exercises.sql')
  }

  by_key = (key: string): AsyncArray<any> => () =>
    this.query({ where: where({ key }) })

  handle_filter = (filter: Record<string, string>) => {
    const { key, name } = filter
    const clauses = {
      ...(key  ? { key }  : {}),
      ...(name ? { name } : {})
    }
    return Object.keys(clauses).length ? where(clauses) : ''
  }
}
