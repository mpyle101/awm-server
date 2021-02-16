import { none, some } from 'fp-ts/lib/Option'
import { connect, Database } from '../db-utils'

import { create_sets_repository } from '../repositories'
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
    const date = new Date(2021, 1, 12);
    const recs = await repository.by_date(date)

    expect(recs.length).toEqual(19)
    expect(recs[0]).toMatchObject(SETS_20210212[0])
    expect(recs[1]).toMatchObject(SETS_20210212[1])

    set_id = recs[0].set_id
  })

  it('should get by id', async () => {
    const recs = await repository.by_ids([set_id])

    expect(recs.length).toEqual(1)
    expect(recs[0]).toMatchObject(SETS_20210212[0])
  })

  it('should get by query', async () => {
    const recs = await repository.by_query({
      limit: none,
      offset: none,
      filter: some({ bob: 'true' })
    })

    expect(recs.length).toEqual(19)
    expect(recs[0]).toMatchObject(SETS_20210212[0])
    expect(recs[1]).toMatchObject(SETS_20210212[1])
  })
})
