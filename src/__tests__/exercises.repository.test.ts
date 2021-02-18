import { pipe } from 'fp-ts/lib/pipeable'
import { getOrElseW, some } from 'fp-ts/lib/Option'
import { getOrElse } from 'fp-ts/lib/TaskEither'

import { connect, Database } from '../db-utils'
import { create_exercises_repository } from '../repositories'

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
        getOrElse(fail),
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
      getOrElse(fail)
    )()

    expect(recs.length).toEqual(1)
    expect(recs[0]).toMatchObject(OHP)
  })
})
