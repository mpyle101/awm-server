import { pipe } from 'fp-ts/pipeable'
import { getOrElseW, some } from 'fp-ts/Option'

import * as TE from 'fp-ts/TaskEither'

import { create_workouts_repository } from '../repositories'
import { connect, Database } from '../utilities/db-utils'
import { rethrow, throw_error } from '../utilities/test-utils'

const WORKOUT_20210214 = {
  wrk_no: 1,
  blk_no: 1,
  grp_no: 1,
  set_no: 1,
  set_type: 'TMD',
  set_exercise: 'TRNR',
  set_weight: 0,
  set_reps: null,
  set_duration: {
    hours: 1,
    minutes: 10
  },
  set_unit: 'BW',
  grp_style: 'STD',
  blk_type: 'EN'
} as const

describe('Workouts repository', () => {
  let db: Database
  let workout_id: number
  let repository: ReturnType<typeof create_workouts_repository>

  beforeAll(async () => {
    ({ db } = await connect('postgres://jester@localhost/awm'))
    repository = create_workouts_repository(db)
  })

  afterAll(() => db.$pool.end())

  it('should get by date', async () => {
    // February 14th, 2021 (month is an index...sigh)
    const recs = await pipe(
      new Date(2021, 1, 14),
      repository.by_date,
      TE.getOrElse(rethrow)
    )()

    expect(recs.length).toEqual(1)
    expect(recs[0]).toMatchObject(WORKOUT_20210214)

    workout_id = recs[0].wrk_id
  })

  it('should get by id', async () => {
    const rec = pipe(
      await pipe(
        workout_id,
        repository.by_id,
        TE.getOrElse(rethrow),
      )(),
      getOrElseW(throw_error(`${workout_id} not found`))
    )

    expect(rec).toBeDefined()
    expect(rec).toMatchObject(WORKOUT_20210214)
  })
})
