import { none, some } from 'fp-ts/lib/Option'
import { connect, Database } from '../db-utils'

import { create_sets_controller } from '../controllers'
import { SETS_20210212 } from './test-data/sets.test-data'

describe('Sets controller', () => {
  let db: Database
  let set_id: number
  let controller: ReturnType<typeof create_sets_controller>

  beforeAll(async () => {
    ({ db } = await connect('postgres://jester@localhost/awm'))
    controller = create_sets_controller(db)
  })

  afterAll(() => db.$pool.end())

  it('should get by date', async () => {
    // February 12th, 2021 (month is an index...sigh)
    const date = new Date(2021, 1, 12);
    const sets = await controller.by_date(date)()

    expect(sets.length).toEqual(19)
    expect(sets[0]).toMatchObject(SETS_20210212[0])
    expect(sets[1]).toMatchObject(SETS_20210212[1])

    set_id = sets[0].set_id
  })

  it('should get by id', async () => {
    const sets = await controller.by_id(set_id)()

    expect(sets.length).toEqual(1)
    expect(sets[0]).toMatchObject(SETS_20210212[0])
  })

  it('should get by query', async () => {
    const sets = await controller.by_query({
      limit: none,
      offset: none,
      filter: some({ bob: 'true' })
    })()

    expect(sets.length).toEqual(19)
    expect(sets[0]).toMatchObject(SETS_20210212[0])
    expect(sets[1]).toMatchObject(SETS_20210212[1])
  })
})
