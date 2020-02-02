import { Lazy } from 'fp-ts/lib/function'
import { fold, toError } from 'fp-ts/lib/Either'
import { Task, map } from 'fp-ts/lib/Task'
import { TaskEither, tryCatch } from 'fp-ts/lib/TaskEither'

export type AsyncArray<A> = Lazy<Promise<A[]>>

export const foldMap = <E, A, B>(
  onLeft: (e: E) => B,
  onRight: (a: A) => B
): (ma: TaskEither<E, A>) => Task<B> => map(fold(onLeft, onRight))

export const tryCatchError = <E, A, B>(f: Lazy<Promise<A>>) => tryCatch(f, toError)