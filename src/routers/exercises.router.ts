import express, { Request, Response, NextFunction as NF } from 'express'
import { flow, pipe } from 'fp-ts/function'

import * as E from 'fp-ts/Either'
import * as O from 'fp-ts/Option'
import * as T from 'fp-ts/Task'

import { Database } from '../utilities/db-utils'
import { foldMap } from '../utilities/fp-utils'
import { parse_query, make_error } from '../utilities/web-utils'

import { create_exercises_controller } from '../controllers'

const to_upper = (s:string) => s.toUpperCase()

export default (db: Database) => {
  const router = express.Router({ strict: true })
  const controller = create_exercises_controller(db)
  const { by_key, by_query } = controller

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
          )
        )
      )
    ))()
  )

  router.get('/:key', async (req: Request, res: Response, next: NF) =>
    (pipe(
      req.params.key,
      to_upper,
      by_key,
      foldMap(
        error => next(make_error(500, error)),
        O.fold(
          () => next(make_error(404)),
          v  => res.json(v)
        )
      )
    ))()
  )

  return router
}
