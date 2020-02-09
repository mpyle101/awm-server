import { STATUS_CODES } from 'http'
import { pipe } from 'fp-ts/lib/pipeable'
import { sequenceS } from 'fp-ts/lib/Apply'
import { either, right } from 'fp-ts/lib/Either'
import { fold, fromNullable, some, none } from 'fp-ts/lib/Option'

import { numberFrom } from '../fp-utils'

export const make_error = (status: number, error?: Error) => ({
  status, error, message: STATUS_CODES[status]
})

export const get_params = ({ filter, limit, offset }) =>
  pipe(
    sequenceS(either)({
      limit:  numberFrom(limit),
      offset: numberFrom(offset),
      filter: pipe(
        fromNullable(filter),
        fold(
          () => right(none),
          a  => right(some<string>(a))
        )
      )
    })
  )

/*
const limit_clause = limit =>
  pipe(
    numberFrom(limit),
    O.map(o => pipe(o, E.map(v => `LIMIT ${v}`))),
    O.getOrElse(() => E.right(''))
  )

const offset_clause = offset =>
  pipe(
    numberFrom(offset),
    O.map(o => pipe(o, E.map(v => `OFFSET ${v}`))),
    O.getOrElse(() => E.right(''))
  )
*/