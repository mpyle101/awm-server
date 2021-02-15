import express, { Request, Response, NextFunction } from 'express'
import { pipe } from 'fp-ts/lib/pipeable'
import { fold } from 'fp-ts/lib/Either'
import { of } from 'fp-ts/lib/Task'

import { CyclesController } from '../controllers'
import { Database } from '../db-utils'
import { foldMap, tryCatchError, integerFrom } from '../fp-utils'
import { make_error } from './utils'

export default (db: Database) => {
  const router = express.Router({ strict: true })
  const controller = new CyclesController(db)

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

  router.get('/:id', (req: Request, res: Response, next: NextFunction) =>
    (pipe(
      integerFrom(req.params.id),
      fold(
        error => of(next(make_error(400, error))),
        workout_id => pipe(
          workout_id,
          controller.get_by_id,
          result => tryCatchError(result),
          foldMap(
            error  => next(make_error(500, error)),
            result => result.length ? res.json(result) : next(make_error(404))
          )
        )
      )
    ))()
  )

  return router
}
