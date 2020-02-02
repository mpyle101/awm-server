import { Lazy } from 'fp-ts/lib/function'
import { Either, fold, left, right, toError } from 'fp-ts/lib/Either'
import { Task, map } from 'fp-ts/lib/Task'
import { TaskEither, tryCatch } from 'fp-ts/lib/TaskEither'

export type AsyncArray<A> = Lazy<Promise<A[]>>

export const foldMap = <E, A, B>(
  onLeft: (e: E) => B,
  onRight: (a: A) => B
): (ma: TaskEither<E, A>) => Task<B> => map(fold(onLeft, onRight))

export const tryCatchError = <E, A, B>(f: Lazy<Promise<A>>) => tryCatch(f, toError)

export const parse_int = (s: string) => {
  const result = parseInt(s, 10)
  if (isNaN(result)) throw new Error('Not a number')
  return result
}
