import { Either, right, left } from 'fp-ts/lib/Either'

export const tryCatch = async <E, A>(fn: () => Promise<A>): Promise<Either<E, A>> => {
  try {
    return Promise.resolve(right<E, A>(await fn()))
  } catch (e) {
    return Promise.resolve(left<E, A>(e))
  }
}

export const is_simple = value =>
  typeof value === 'number' ||
  typeof value === 'string' ||
  typeof value === 'boolean' ||
  value instanceof Date ||
  value === null
