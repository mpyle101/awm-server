import express, { Request, Response, NextFunction } from 'express'
import { pipe } from 'fp-ts/lib/pipeable'
import { fold } from 'fp-ts/lib/Either'
import { of } from 'fp-ts/lib/Task'

import { ExercisesController } from '../controllers'
import { Database } from '../db-utils'
import { foldMap, tryCatchError } from '../fp-utils'
import { get_params, make_error } from './utils'

export default (db: Database) => {
  const router = express.Router({ strict: true })
  const controller = new ExercisesController(db)

  router.get('/', (req: Request, res: Response, next: NextFunction) =>
    (pipe(
      get_params(req.query),
      fold(
        error => of(next(make_error(400, error))),
        params => pipe(
          controller.by_query(params),
          result => tryCatchError(result),
          foldMap(
            error => next(make_error(500, error)),
            result => res.json(result)
          )
        )
      )
    ))()
  )

  router.get('/:key', async (req: Request, res: Response, next: NextFunction) =>
    (pipe(
      req.params.key.toUpperCase(),
      controller.by_key,
      result => tryCatchError(result),
      foldMap(
        error  => next(make_error(500, error)),
        result => result.length ? res.json(result) : next(make_error(404))
      )
    ))()
  )

  return router
}
