import { STATUS_CODES } from 'http'
import { ParsedQs } from 'qs'
import { pipe } from 'fp-ts/lib/pipeable'
import { sequenceS } from 'fp-ts/lib/Apply'
import { either, right } from 'fp-ts/lib/Either'
import { fold, fromNullable, some, none } from 'fp-ts/lib/Option'

import { numberFrom } from '../fp-utils'

export interface IParams extends ParsedQs {
  filter: string
  limit: string
  offset: string
}

export const make_error = (status: number, error?: Error) => ({
  status, error, message: STATUS_CODES[status]
})

export const get_params = ({ filter, limit, offset }) =>
  pipe(
    sequenceS(either)({
      limit:  numberFrom(limit),
      offset: numberFrom(offset),
      filter: pipe(
        fromNullable<string>(filter),
        fold(
          () => right(none),
          a  => right(some(a))
        )
      )
    })
  )
