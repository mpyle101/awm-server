import { pipe } from 'fp-ts/lib/pipeable'
import { getOrElseW, some } from 'fp-ts/lib/Option'
import { getOrElse } from 'fp-ts/lib/TaskEither'

import { connect, Database } from '../db-utils'
import { create_cycles_repository } from '../repositories'

const SL1 = {
  name: 'SL 1',
  start_date: new Date('2015-03-02T07:00:00.000Z'),
  end_date: new Date('2015-03-08T07:00:00.000Z')
} as const

describe('Cycles repository', () => {
  let db: Database
  let cycle_id: number
  let repository: ReturnType<typeof create_cycles_repository>

  beforeAll(async () => {
    ({ db } = await connect('postgres://jester@localhost/awm'))
    repository = create_cycles_repository(db)
  })

  afterAll(() => db.$pool.end())

  it('should get by query', async () => {
    const recs = await pipe(
      some({ name: 'SL 1' }),
      repository.by_query,
      getOrElse(fail)
    )()

    expect(recs.length).toEqual(1)
    expect(recs[0]).toMatchObject(SL1)

    cycle_id = recs[0].id
  })

  it('should get by id', async () => {
    const rec = pipe(
      await pipe(
        cycle_id,
        repository.by_id,
        getOrElse(fail),
      )(),
      getOrElseW(() => fail(`${cycle_id} not found`))
    )

    expect(rec).toBeDefined()
    expect(rec).toMatchObject(SL1)
  })
})
