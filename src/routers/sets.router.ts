import express, { Request, Response, NextFunction } from 'express'
import { pipe } from 'fp-ts/lib/pipeable'
import { fold } from 'fp-ts/lib/Either'
import { of } from 'fp-ts/lib/Task'

import { create_sets_controller } from '../controllers'
import { Database } from '../db-utils'
import { foldMap, tryCatchError, from_date, from_intstr } from '../fp-utils'
import { make_error, get_params } from './utils'

export default (db: Database) => {
  const router = express.Router({ strict: true })
  const controller = create_sets_controller(db)

  router.get('/', (req: Request, res: Response, next: NextFunction) =>
    (pipe(
      get_params(req.query),
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
      from_intstr(req.params.id),
      fold(
        error => of(next(make_error(400, error))),
        set_id => pipe(
          controller.by_id(set_id),
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
      from_date(req.params as any),
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
      from_date(req.params as any),
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
