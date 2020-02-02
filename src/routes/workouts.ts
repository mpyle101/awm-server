import express, { Request, Response, NextFunction as NF } from 'express'
import parse from 'date-fns/parse'
import { pipe } from 'fp-ts/lib/pipeable'

import { Database } from '../db-utils'
import { foldMap, tryCatchError } from '../fp-utils'
import { WorkoutController } from '../controllers'

export default (db: Database) => {
  const router = express.Router({ strict: true })
  const controller = new WorkoutController(db)

  const get_date = params => {
    const year  = parseInt(params.year, 10)
    const month = parseInt(params.month, 10)
    const day   = params.day ? parseInt(params.day, 10) : 1
    return new Date(year, month - 1, day)
  }

  router.get('/', (req: Request, res: Response, next: NF) =>
    (pipe(
      controller.get_all,
      result => tryCatchError(result),
      foldMap(
        error  => next({ error, message: 'Internal error' }),
        result => res.json(result)
      )
    ))()
  )

  router.get('/:id', (req: Request, res: Response, next: NF) =>
    (pipe(
      parseInt(req.params.id, 10),
      controller.get_by_id,
      result => tryCatchError(result),
      foldMap(
        error  => next({ error, message: 'Internal error' }),
        result => result.length ? res.json(result) : next({ status: 404 })
      )
    ))()
  )

  router.get('/:year/:month', (req: Request, res: Response, next: NF) =>
    (pipe(
      get_date(req.params),
      controller.get_by_month,
      result => tryCatchError(result),
      foldMap(
        error  => next({ error, message: 'Internal error' }),
        result => res.json(result)
      )
    ))()
  )

  router.get('/:year/:month/:day', (req: Request, res: Response, next: NF) =>
    (pipe(
      get_date(req.params),
      controller.get_by_date,
      result => tryCatchError(result),
      foldMap(
        error  => next({ error, message: 'Internal error' }),
        result => res.json(result)
      )
    ))()
  )

  return router
}
