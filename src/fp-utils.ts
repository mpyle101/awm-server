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

export const foldMap = <E, A, B>(
  onLeft: (e: E) => B,
  onRight: (a: A) => B
): (ma: TaskEither<E, A>) => Task<B> => T.map(E.fold(onLeft, onRight))

export const tryCatchError = <E, A, B>(f: Lazy<Promise<A>>) => TE.tryCatch(f, E.toError)

export const dateFrom = ({ year, month, day='01' }) =>
  pipe(
    sequenceS(E.either)({
      year:  integerFrom(year),
      month: integerFrom(month),
      day:   integerFrom(day)
    }),
    E.map(({ year, month, day }) => new Date(year, month - 1, day))
  )

export const numberFrom = (s?: string) =>
  pipe(
    O.fromNullable(s),
    O.fold(
      () => E.right(O.none),
      a  => pipe(
        integerFrom(a),
        E.map(res => O.some(res))
      )
    )
  )

export const recordFrom = (obj: { [x: string]: string }) =>
  pipe(
    Object.keys(obj).length ? O.some(obj) : O.none,
    O.fold(
      () => E.right(O.none),
      a  => E.right(O.some(a as Record<string, string>))
    )
  )

export const integerFrom = (s: string) => {
  const result = parseInt(s, 10)
  return isNaN(result) ? E.left(new Error('Not a number')) : E.right(result)
}
