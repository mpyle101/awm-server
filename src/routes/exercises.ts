import express, { Request, Response, NextFunction } from 'express'
import { pipe } from 'fp-ts/lib/pipeable'

import { Database } from '../db-utils'
import { foldMap, tryCatchError } from '../fp-utils'

import { ExerciseController } from '../controllers'
import { make_error } from './utils'

export default (db: Database) => {
  const router = express.Router({ strict: true })
  const controller = new ExerciseController(db)

  router.get('/', (req: Request, res: Response, next: NextFunction) =>
    (pipe(
      controller.get_all,
      result => tryCatchError(result),
      foldMap(
        error  => next(make_error(500, error)),
        result => res.json(result)
      )
    ))()
  )

  router.get('/:key', async (req: Request, res: Response, next: NextFunction) =>
    (pipe(
      req.params.key.toUpperCase(),
      controller.get_by_key,
      result => tryCatchError(result),
      foldMap(
        error  => next(make_error(500, error)),
        result => result.length ? res.json(result) : next(make_error(404))
      )
    ))()
  )

  return router
}
