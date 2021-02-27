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

const to_upper = (s: string) => s.toUpperCase()

export default (db: Database) => {
  const router = express.Router({ strict: true })
  const controller = create_sets_controller(db)
  const { by_key, by_reps, by_query } = controller
  const top_reps = (reps: number) => 
    (key: string) => by_reps(key, reps)

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

  router.get('/:key', (req: Request, res: Response, next: NF) =>
    (pipe(
      req.params.key,
      to_upper,
      by_key,
      foldMap(
        error  => next(make_error(500, error)),
        result => res.json(result)
      )
    ))()
  )

  router.get('/:key/top', (req: Request, res: Response, next: NF) =>
    (pipe(
      req.params.key,
      to_upper,
      top_reps(5),
      foldMap(
        error  => next(make_error(500, error)),
        result => res.json(result)
      )
    ))()
  )

  return router
}
