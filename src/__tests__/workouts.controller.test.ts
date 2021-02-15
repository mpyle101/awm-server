import { none, some } from 'fp-ts/lib/Option'
import { connect, Database } from '../db-utils'

import { create_workouts_controller } from '../controllers'

const SET_20210214 = {
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

describe('Workouts controller', () => {
  let db: Database
  let workout_id: number
  let controller: ReturnType<typeof create_workouts_controller>

  beforeAll(async () => {
    ({ db } = await connect('postgres://jester@localhost/awm'))
    controller = create_workouts_controller(db)
  })

  afterAll(() => db.$pool.end())

  it('should get by date', async () => {
    // February 14th, 2021 (month is an index...sigh)
    const date = new Date(2021, 1, 14);
    const recs = await controller.by_date(date)()

    expect(recs.length).toEqual(1)
    expect(recs[0]).toMatchObject(SET_20210214)

    workout_id = recs[0].wrk_id
  })

  it('should get by id', async () => {
    const recs = await controller.by_id(workout_id)()

    expect(recs.length).toEqual(1)
    expect(recs[0]).toMatchObject(SET_20210214)
  })
})
