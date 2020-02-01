import express, { Request, Response } from 'express'
import parse from 'date-fns/parse'
import { Database } from '../db-utils'
import { WorkoutController } from '../controllers'

export default (db: Database) => {
  const router = express.Router({ strict: true })
  const controller = new WorkoutController(db)

  router.get('/', (req: Request, res: Response) => {
    throw new Error('All workouts not implemented')
  })

  router.get('/:id', async (req: Request, res: Response) => {
    const workout_id = parseInt(req.params.id, 10)
    const sets = await controller.get_by_id(workout_id)
    if (sets.length === 0) {
      res.status(404).send('Not found')
    } else {
      res.json(sets)
    }
  })

  router.get('/:year/:month', async (req: Request, res: Response) => {
    const year  = parseInt(req.params.year, 10)
    const month = parseInt(req.params.month, 10)
    const date  = new Date(year, month - 1, 1)
    const sets  = await controller.get_by_month(date)
    res.json(sets)
  })

  router.get('/:year/:month/:day', async (req: Request, res: Response) => {
    const year  = parseInt(req.params.year, 10)
    const month = parseInt(req.params.month, 10)
    const day   = parseInt(req.params.day, 10)
    const date = new Date(year, month - 1, day)
    const sets = await controller.get_by_date(date)
    res.json(sets)
  })

  return router
}
