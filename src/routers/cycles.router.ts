import express, { Request, Response, NextFunction as NF } from 'express'
import { flow } from 'fp-ts/function'
import { pipe } from 'fp-ts/lib/pipeable'

import * as E from 'fp-ts/Either'
import * as O from 'fp-ts/Option'
import * as T from 'fp-ts/Task'

import { Database } from '../db-utils'
import { foldMap, from_date, from_intstr } from '../fp-utils'
import { get_params, make_error } from './utils'

import { create_cycles_controller } from '../controllers'

export default (db: Database) => {
  const router = express.Router({ strict: true })
  const controller = create_cycles_controller(db)
  const { by_id, by_month, by_query } = controller

  router.get('/', (req: Request, res: Response, next: NF) =>
    (pipe(
      get_params(req.query),
      E.fold(
        error => T.of(next(make_error(400, error))),
        flow(
          by_query,
          foldMap(
            error => next(make_error(500, error)),
            result => res.json(result)
          )
        )
      )
    ))()
  )

  router.get('/:id', (req: Request, res: Response, next: NF) =>
    (pipe(
      from_intstr(req.params.id),
      E.fold(
        error => T.of(next(make_error(400, error))),
        flow(
          by_id,
          foldMap(
            error => next(make_error(500, error)),
            O.fold(
              () => next(make_error(404)),
              v  => res.json(v)
            )
          )
        )
      )
    ))()
  )

  router.get('/:year/:month', (req: Request, res: Response, next: NF) =>
    (pipe(
      from_date(req.params as any),
      E.fold(
        error => T.of(next(make_error(400, error))),
        flow(
          by_month,
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
