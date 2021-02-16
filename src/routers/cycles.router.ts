import express, { Request, Response, NextFunction } from 'express'
import { pipe } from 'fp-ts/lib/pipeable'
import { fold } from 'fp-ts/lib/Either'
import { of } from 'fp-ts/lib/Task'

import { Database } from '../db-utils'
import { foldMap, from_date, from_intstr, from_thunk } from '../fp-utils'
import { get_params, make_error } from './utils'

import { create_cycles_controller } from '../controllers'

export default (db: Database) => {
  const router = express.Router({ strict: true })
  const controller = create_cycles_controller(db)

  router.get('/', (req: Request, res: Response, next: NextFunction) =>
    (pipe(
      get_params(req.query),
      fold(
        error => of(next(make_error(400, error))),
        params => pipe(
          controller.by_query(params),
          result => from_thunk(result),
          foldMap(
            error => next(make_error(500, error)),
            result => res.json(result)
          )
        )
      )
    ))()
  )

  router.get('/:id', (req: Request, res: Response, next: NextFunction) =>
    (pipe(
      from_intstr(req.params.id),
      fold(
        error => of(next(make_error(400, error))),
        cycle_id => pipe(
          controller.by_id(cycle_id),
          result => from_thunk(result),
          foldMap(
            error => next(make_error(500, error)),
            result => result.length ? res.json(result) : next(make_error(404))
          )
        )
      )
    ))()
  )

  router.get('/:year/:month', (req: Request, res: Response, next: NextFunction) =>
    (pipe(
      from_date(req.params as any),
      fold(
        error => of(next(make_error(400, error))),
        date => pipe(
          controller.by_month(date),
          result => from_thunk(result),
          foldMap(
            error => next(make_error(500, error)),
            result => res.json(result)
          )
        )
      )
    ))()
  )

  return router
}
