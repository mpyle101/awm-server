import { pipe } from 'fp-ts/lib/pipeable'
import { sequenceS } from 'fp-ts/lib/Apply'
import { Lazy } from 'fp-ts/lib/function'
import { Task } from 'fp-ts/lib/Task'
import { TaskEither } from 'fp-ts/lib/TaskEither'

import * as E from 'fp-ts/lib/Either'
import * as O from 'fp-ts/lib/Option'
import * as T from 'fp-ts/lib/Task'
import * as TE from 'fp-ts/lib/TaskEither'

export type AsyncArray<A> = Lazy<Promise<A[]>>
export type AsyncResult<A> = Lazy<Promise<A>>

export const foldMap = <E, A, B>(
  onLeft:  (e: E) => B,
  onRight: (a: A) => B
): (ma: TaskEither<E, A>) => Task<B> => T.map(E.fold(onLeft, onRight))

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
