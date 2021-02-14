import { none, some } from 'fp-ts/lib/Option'
import { SetsController } from '../controllers'
import { connect, Database } from '../db-utils'

import { SETS_20210212 } from './test-data/sets.test-data'

describe('Sets controller tests', () => {
  let db: Database
  let controller: SetsController

  beforeAll(async () => {
    ({ db } = await connect('postgres://jester@localhost/awm'))
    controller = new SetsController(db)
  })

  afterAll(() => db.$pool.end())

  it('should get by date', async () => {
    // February 12th, 2021 (month is an index...sigh)
    const date = new Date(2021, 1, 12);
    const sets = await controller.by_date(date)()

    expect(sets.length).toEqual(19)
    expect(sets[0]).toMatchObject(SETS_20210212[0])
    expect(sets[1]).toMatchObject(SETS_20210212[1])
  })

  it('should by query', async () => {
    const sets = await controller.by_query({
      limit: none,
      offset: none,
      filter: some<string>('bob')
    })()

    expect(sets.length).toEqual(19)
    expect(sets[0]).toMatchObject(SETS_20210212[0])
    expect(sets[1]).toMatchObject(SETS_20210212[1])
  })

})
