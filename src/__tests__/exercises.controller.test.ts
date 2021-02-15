import { none, some } from 'fp-ts/lib/Option'
import { connect, Database } from '../db-utils'

import { create_exercises_controller } from '../controllers'

const OHP = {
  key: 'OHP',
  name: 'Overhead Press',
  unit: 'KG'
} as const

describe('Exercises controller', () => {
  let db: Database
  let controller: ReturnType<typeof create_exercises_controller>

  beforeAll(async () => {
    ({ db } = await connect('postgres://jester@localhost/awm'))
    controller = create_exercises_controller(db)
  })

  afterAll(() => db.$pool.end())

  it('should get by key', async () => {
    const recs = await controller.by_key('OHP')()

    expect(recs.length).toEqual(1)
    expect(recs[0]).toMatchObject(OHP)
  })

  it('should get by query', async () => {
    const recs = await controller.by_query({
      limit: none,
      offset: none,
      filter: some({ name: 'Overhead Press' })
    })()

    expect(recs.length).toEqual(1)
    expect(recs[0]).toMatchObject(OHP)
  })
})
