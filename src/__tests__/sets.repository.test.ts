import { pipe } from 'fp-ts/pipeable'
import { getOrElseW, some } from 'fp-ts/Option'
import { getOrElse } from 'fp-ts/TaskEither'

import { create_sets_repository, SetRecord } from '../repositories'
import { connect, Database } from '../utilities/db-utils'
import { foldMap, rethrow } from '../utilities/fp-utils'

describe('Sets repository', () => {
  let database: Database
  let set_data: SetRecord
  let repository: ReturnType<typeof create_sets_repository>

  beforeAll(() =>
    pipe(
      connect('postgres://jester@localhost/awm'),
      foldMap(
        rethrow,
        ({ db }) => {
          database   = db
          repository = create_sets_repository(db)
        }
      )
    )()
  )

  afterAll(() => database.$pool.end())

  it('should get by exercise', async () => {
    const recs = await pipe(
      'OHP',
      repository.by_key,
      getOrElse(rethrow),
    )()

    expect(recs.length).toBeTruthy()
    expect(recs[0].set_exercise).toEqual('OHP')

    set_data = recs[0]
  })

  it('should get by query', async () => {
    const recs = await pipe(
      some({ 'set.id': set_data.set_id }),
      repository.by_query,
      getOrElse(rethrow)
    )()

    expect(recs.length).toEqual(1)
    expect(recs[0]).toMatchObject(set_data)
  })
})
