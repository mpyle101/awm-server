import { pipe } from 'fp-ts/lib/pipeable'
import { getOrElseW, some } from 'fp-ts/lib/Option'
import { getOrElse } from 'fp-ts/lib/TaskEither'

import { create_sets_repository } from '../repositories'
import { connect, Database } from '../utilities/db-utils'
import { rethrow, throw_error } from '../utilities/test-utils'
import { SETS_20210212 } from './test-data/sets.test-data'


describe('Sets repository', () => {
  let db: Database
  let set_id: number
  let repository: ReturnType<typeof create_sets_repository>

  beforeAll(async () => {
    ({ db } = await connect('postgres://jester@localhost/awm'))
    repository = create_sets_repository(db)
  })

  afterAll(() => db.$pool.end())

  it('should get by date', async () => {
    // February 12th, 2021 (month is an index...sigh)
    const recs = await pipe(
      new Date(2021, 1, 12),
      repository.by_date,
      getOrElse(rethrow)
    )()

    expect(recs.length).toEqual(19)
    expect(recs[0]).toMatchObject(SETS_20210212[0])
    expect(recs[1]).toMatchObject(SETS_20210212[1])

    set_id = recs[0].set_id
  })

  it('should get by id', async () => {
    const rec = pipe(
      await pipe(
        set_id,
        repository.by_id,
        getOrElse(rethrow),
      )(),
      getOrElseW(throw_error(`${set_id} not found`))
    )

    expect(rec).toBeDefined()
    expect(rec).toMatchObject(SETS_20210212[0])
  })

  it('should get by ids', async () => {
    const recs = await pipe(
      [set_id],
      repository.by_ids,
      getOrElse(rethrow)
    )()

    expect(recs.length).toEqual(1)
    expect(recs[0]).toMatchObject(SETS_20210212[0])
  })

  it('should get by query', async () => {
    const recs = await pipe(
      some({ 'set.id': set_id }),
      repository.by_query,
      getOrElse(rethrow)
    )()

    expect(recs.length).toEqual(1)
    expect(recs[0]).toMatchObject(SETS_20210212[0])
  })
})
