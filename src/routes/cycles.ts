import express, { Request, Response, NextFunction } from 'express'
import { pipe } from 'fp-ts/lib/pipeable'
import { fold, tryCatch, toError } from 'fp-ts/lib/Either'
import { of } from 'fp-ts/lib/Task'

import { Database } from '../db-utils'
import { foldMap, tryCatchError, parse_int } from '../fp-utils'
import { CycleController } from '../controllers'

export default (db: Database) => {
  const router = express.Router({ strict: true })
  const controller = new CycleController(db)

  router.get('/', (req: Request, res: Response, next: NextFunction) =>
    (pipe(
      controller.get_all,
      result => tryCatchError(result),
      foldMap(
        error  => next({ error, message: 'Internal error' }),
        result => res.json(result)
      )
    ))()
  )

  router.get('/:id', (req: Request, res: Response, next: NextFunction) =>
    (pipe(
      tryCatch(() => parse_int(req.params.id), toError),
      fold(
        error => of(next({ error, message: 'Invalid id' })),
        workout_id => pipe(
          workout_id,
          controller.get_by_id,
          result => tryCatchError(result),
          foldMap(
            error => next({ error, message: 'Internal error' }),
            result => result.length ? res.json(result) : next({ status: 404 })
          )
        )
      )
    ))()
  )

  return router
}
