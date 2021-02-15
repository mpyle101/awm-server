import { STATUS_CODES } from 'http'
import { ParsedQs } from 'qs'
import { pipe } from 'fp-ts/lib/pipeable'
import { sequenceS } from 'fp-ts/lib/Apply'
import { either, right } from 'fp-ts/lib/Either'
import { Option, fold, fromNullable, some, none } from 'fp-ts/lib/Option'

import { numberFrom, recordFrom } from '../fp-utils'

export const make_error = (status: number, error?: Error) => ({
  status, error, message: STATUS_CODES[status]
})

export const get_params = (query = {}) => {
  const { limit, offset, ...rest } = (query as any)

  return pipe(
    sequenceS(either)({
      limit:  numberFrom(limit),
      offset: numberFrom(offset),
      filter: recordFrom(rest)
    })
  )
}
