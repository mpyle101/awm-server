import { Option} from 'fp-ts/lib/Option'

export type QueryParams = {
  limit:  Option<number>
  offset: Option<number>
  filter: Option<Record<string, string>>
}

export type BlockRecord = {
  date: string
  wrk_id: number
  blk_id: number
  wrk_no: number
  blk_no: number
  blk_type: string
  blk_notes: string
  blk_style: string
  blk_duration: object
  blk_exercise: string
  blk_distance: string
}

export type CycleRecord = {
  id: number
  name: string
  start_date: string
  end_data: string
}

export type ExerciseRecord = {
  key: string
  name: string
  unit: string
}

export type SetRecord = {
  date: string
  wrk_id: number
  blk_id: number
  set_id: number
  wrk_no: number
  blk_no: number
  grp_no: number
  set_no: number
  set_type: string
  set_notes: string
  set_exercise: string
  set_weight: number
  set_unit: string
  set_reps: number
  set_duration: object
  set_distance: string
  grp_style: string
  blk_type: string
  blk_notes: string
  blk_style: string
  blk_duration: object
  blk_exercise: string
  blk_distance: string
}

export type UserRecord = {
  id: number
  email: string
  username: string
  first_name: string
  last_name: string
}

export type WorkoutRecord = {
  date: string
  wrk_id: number
  blk_id: number
  set_id: number
  wrk_no: number
  blk_no: number
  grp_no: number
  set_no: number
  set_type: string
  set_notes: string
  set_exercise: string
  set_weight: number
  set_unit: string
  set_reps: number
  set_duration: object
  set_distance: string
  grp_style: string
  blk_type: string
  blk_notes: string
  blk_style: string
  blk_duration: object
  blk_exercise: string
  blk_distance: string
}