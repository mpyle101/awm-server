import { pipe } from 'fp-ts/function'
import { getOrElseW, some } from 'fp-ts/Option'
import { getOrElse } from 'fp-ts/TaskEither'

import { create_exercises_repository } from '../repositories'
import { connect, Database } from '../utilities/db-utils'
import { rethrow } from '../utilities/test-utils'

const OHP = {
  key: 'OHP',
  name: 'Overhead Press',
  unit: 'KG'
} as const

describe('Exercises repository', () => {
  let db: Database
  let repository: ReturnType<typeof create_exercises_repository>

  beforeAll(async () => {
    ({ db } = await connect('postgres://jester@localhost/awm'))
    repository = create_exercises_repository(db)
  })

  afterAll(() => db.$pool.end())

  it('should get by key', async () => {
    const rec = pipe(
      await pipe(
        'OHP',
        repository.by_key,
        getOrElse(rethrow),
      )(),
      getOrElseW(() => fail(`OHP not found`))
    )

    expect(rec).toBeDefined()
    expect(rec).toMatchObject(OHP)
  })

  it('should get by query', async () => {
    const recs = await pipe(
      some({ name: 'Overhead Press' }),
      repository.by_query,
      getOrElse(rethrow)
    )()

    expect(recs.length).toEqual(1)
    expect(recs[0]).toMatchObject(OHP)
  })
})
