import express, { Request, Response, NextFunction as NF } from 'express'
import { flow, pipe } from 'fp-ts/function'

import * as E from 'fp-ts/Either'
import * as O from 'fp-ts/Option'
import * as T from 'fp-ts/Task'
import * as TE from 'fp-ts/TaskEither'

import { create_sets_controller } from '../controllers'
import { Database } from '../utilities/db-utils'
import { foldMap, from_date, from_intstr } from '../utilities/fp-utils'
import { make_error, parse_query } from '../utilities/web-utils'

export default (db: Database) => {
  const router = express.Router({ strict: true })
  const controller = create_sets_controller(db)
  const { by_id, by_date, by_month, by_query } = controller

  router.get('/', (req: Request, res: Response, next: NF) =>
    (pipe(
      parse_query(req.query),
      E.fold(
        error => T.of(next(make_error(400, error))),
        flow(
          by_query,
          foldMap(
            error  => next(make_error(500, error)),
            result => res.json(result)
          ),
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

  router.get('/:year/:month/:day', (req: Request, res: Response, next: NF) =>
    (pipe(
      from_date(req.params as any),
      E.fold(
        error => T.of(next(make_error(400, error))),
        flow(
          by_date,
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
