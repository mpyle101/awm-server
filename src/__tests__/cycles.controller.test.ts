import { none, some } from 'fp-ts/lib/Option'
import { connect, Database } from '../db-utils'

import { create_cycles_controller } from '../controllers'

const SL1 = {
  name: 'SL 1',
  start_date: new Date('2015-03-02T07:00:00.000Z'),
  end_date: new Date('2015-03-08T07:00:00.000Z')
} as const

describe('Cycles controller', () => {
  let db: Database
  let cycle_id: number
  let controller: ReturnType<typeof create_cycles_controller>

  beforeAll(async () => {
    ({ db } = await connect('postgres://jester@localhost/awm'))
    controller = create_cycles_controller(db)
  })

  afterAll(() => db.$pool.end())

  it('should get by query', async () => {
    const recs = await controller.by_query({
      limit: none,
      offset: none,
      filter: some({ name: 'SL 1' })
    })()

    expect(recs.length).toEqual(1)
    expect(recs[0]).toMatchObject(SL1)

    cycle_id = recs[0].id
  })

  it('should get by id', async () => {
    const recs = await controller.by_id(cycle_id)()

    expect(recs.length).toEqual(1)
    expect(recs[0]).toMatchObject(SL1)
  })
})
