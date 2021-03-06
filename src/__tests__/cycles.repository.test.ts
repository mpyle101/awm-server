import { pipe } from 'fp-ts/function'
import { getOrElseW, some } from 'fp-ts/Option'
import { getOrElse } from 'fp-ts/TaskEither'

import { create_cycles_repository } from '../repositories'
import { connect, Database } from '../utilities/db-utils'
import { foldMap, rethrow, throw_error } from '../utilities/fp-utils'

const SL1 = {
  name: 'SL 1',
  start_date: new Date('2015-03-02T07:00:00.000Z'),
  end_date: new Date('2015-03-08T07:00:00.000Z')
} as const

describe('Cycles repository', () => {
  let database: Database
  let cycle_id: number
  let repository: ReturnType<typeof create_cycles_repository>

  beforeAll(() =>
    pipe(
      connect('postgres://jester@localhost/awm'),
      foldMap(
        rethrow,
        ({ db }) => {
          database   = db
          repository = create_cycles_repository(db)
        }
      )
    )()
  )

  afterAll(() => database.$pool.end())

  it('should get by query', async () => {
    const recs = await pipe(
      some({ name: 'SL 1' }),
      repository.by_query,
      getOrElse(rethrow)
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
        getOrElse(rethrow),
      )(),
      getOrElseW(throw_error(`${cycle_id} not found`))
    )

    expect(rec).toMatchObject(SL1)
  })
})
