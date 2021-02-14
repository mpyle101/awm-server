import express, { Request, Response, NextFunction } from 'express'
import { pipe } from 'fp-ts/lib/pipeable'
import { fold } from 'fp-ts/lib/Either'
import { of } from 'fp-ts/lib/Task'

import { Database } from '../db-utils'
import { foldMap, dateFrom, parse_int, tryCatchError } from '../fp-utils'
import { SetsController } from '../controllers'
import { IParams, make_error, get_params } from './utils'

export default (db: Database) => {
  const router = express.Router({ strict: true })
  const controller = new SetsController(db)

  router.get('/', (req: Request, res: Response, next: NextFunction) =>
    (pipe(
      get_params(req.query as IParams),
      fold(
        error  => of(next(make_error(400, error))),
        params => pipe(
          controller.by_query(params),
          result => tryCatchError(result),
          foldMap(
            error  => next(make_error(500, error)),
            result => res.json(result)
          )
        )
      )
    ))()
  )

  router.get('/:id', (req: Request, res: Response, next: NextFunction) =>
    (pipe(
      parse_int(req.params.id),
      fold(
        error => of(next(make_error(400, error))),
        workout_id => pipe(
          controller.by_id(workout_id),
          result => tryCatchError(result),
          foldMap(
            error  => next(make_error(500, error)),
            result => result.length ? res.json(result) : next(make_error(404))
          )
        )
      )
    ))()
  )

  router.get('/:year/:month', (req: Request, res: Response, next: NextFunction) =>
    (pipe(
      dateFrom(req.params as any),
      fold(
        error => of(next(make_error(400, error))),
        date  => pipe(
          controller.by_month(date),
          result => tryCatchError(result),
          foldMap(
            error  => next(make_error(500, error)),
            result => res.json(result)
          )
        )
      )
    ))()
  )

  router.get('/:year/:month/:day', (req: Request, res: Response, next: NextFunction) =>
    (pipe(
      dateFrom(req.params as any),
      fold(
        error => of(next(make_error(400, error))),
        date  => pipe(
          controller.by_date(date),
          result => tryCatchError(result),
          foldMap(
            error  => next(make_error(500, error)),
            result => res.json(result)
          )
        )
      )
    ))()
  )

  return router
}