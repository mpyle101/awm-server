import { pipe } from 'fp-ts/pipeable'
import { flow, Lazy } from 'fp-ts/function'
import { sequenceS } from 'fp-ts/Apply'
import { Task } from 'fp-ts/Task'
import { TaskEither } from 'fp-ts/TaskEither'

import * as E from 'fp-ts/Either'
import * as O from 'fp-ts/Option'
import * as T from 'fp-ts/Task'
import * as TE from 'fp-ts/TaskEither'

export type AsyncArray<A> = Lazy<Promise<A[]>>
export type AsyncResult<A> = Lazy<Promise<A>>

export const foldMap = flow(E.fold, T.map)

export const from_thunk = <A>(f: AsyncResult<A>) => TE.tryCatch(f, E.toError)

export const from_date = ({ year, month, day='01' }) =>
  pipe(
    sequenceS(E.either)({
      year:  from_intstr(year),
      month: from_intstr(month),
      day:   from_intstr(day)
    }),
    E.map(({ year, month, day }) => new Date(year, month - 1, day))
  )

export const from_numstr = (s?: string) =>
  pipe(
    O.fromNullable(s),
    O.fold(
      () => E.right(O.none),
      a  => pipe(
        from_intstr(a),
        E.map(res => O.some(res))
      )
    )
  )

export const from_intstr = (s: string) => {
  const result = parseInt(s, 10)
  return isNaN(result) 
    ? E.left(new Error(`Not a number: ${s}`))
    : E.right(result)
}

export const from_object = (obj: { [x: string]: string }) =>
  pipe(
    Object.keys(obj).length ? O.some(obj) : O.none,
    O.fold(
      () => E.right(O.none),
      a  => E.right(O.some(a as Record<string, string>))
    )
  )
