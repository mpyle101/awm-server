import { STATUS_CODES } from 'http'
import { pipe } from 'fp-ts/pipeable'
import { sequenceS } from 'fp-ts/Apply'
import { either } from 'fp-ts/Either'

import { from_numstr, from_object } from './fp-utils'

export const make_error = (status: number, error?: Error) => ({
  status, error, message: STATUS_CODES[status]
})

export const parse_query = (query = {}) => {
  const { limit, offset, ...rest } = (query as any)

  return pipe(
    sequenceS(either)({
      limit:  from_numstr(limit),
      offset: from_numstr(offset),
      filter: from_object(rest)
    })
  )
}
