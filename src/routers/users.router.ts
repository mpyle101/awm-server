import express, { Request, Response, NextFunction as NF } from 'express'
import { flow, pipe } from 'fp-ts/function'

import * as E from 'fp-ts/Either'
import * as O from 'fp-ts/Option'
import * as T from 'fp-ts/Task'

import { Database } from '../utilities/db-utils'
import { foldMap } from '../utilities/fp-utils'
import { parse_query, make_error } from '../utilities/web-utils'

import { create_users_controller } from '../controllers'

const get_params = params => ({
  username: params.username.toLowerCase(),
  password: params.password
})

export default (db: Database) => {
  const router = express.Router({ strict: true })
  const controller = create_users_controller(db)
  const { by_uname } = controller

  router.get('/:username/:password', async (req: Request, res: Response, next: NF) =>
    (pipe(
      req.params,
      get_params,
      by_uname,
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
