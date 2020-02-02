import express, { Request, Response, NextFunction } from 'express'
import parse from 'date-fns/parse'
import { pipe } from 'fp-ts/lib/pipeable'
import { tryCatch, fold, toError } from 'fp-ts/lib/Either'
import { of } from 'fp-ts/lib/Task'

import { Database } from '../db-utils'
import { foldMap, parse_int, tryCatchError } from '../fp-utils'
import { WorkoutController } from '../controllers'

export default (db: Database) => {
  const router = express.Router({ strict: true })
  const controller = new WorkoutController(db)

  const get_date = ({ year, month, day='01' }) =>
    new Date(parse_int(year), parse_int(month) - 1, parse_int(day))

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
        error => of(next({ error, message: 'Invalid id'})),
        workout_id => pipe(
          workout_id,
          controller.get_by_id,
          result => tryCatchError(result),
          foldMap(
            error  => next({ error, message: 'Internal error' }),
            result => result.length ? res.json(result) : next({ status: 404 })
          )
        )
      )
    ))()
  )

  router.get('/:year/:month', (req: Request, res: Response, next: NextFunction) =>
    (pipe(
      tryCatch(() => get_date(req.params as any), toError),
      fold(
        error => of(next({ error, message: 'Invalid date'})),
        date  => pipe(
          date,
          controller.get_by_month,
          result => tryCatchError(result),
          foldMap(
            error  => next({ error, message: 'Internal error' }),
            result => res.json(result)
          )
        )
      )
    ))()
  )

  router.get('/:year/:month/:day', (req: Request, res: Response, next: NextFunction) =>
    (pipe(
      tryCatch(() => get_date(req.params as any), toError),
      fold(
        error => of(next({ error, message: 'Invalid date' })),
        date  => pipe(
          date,
          controller.get_by_date,
          result => tryCatchError(result),
          foldMap(
            error => next({ error, message: 'Internal error' }),
            result => res.json(result)
          )
        )
      )
    ))()
  )

  return router
}
