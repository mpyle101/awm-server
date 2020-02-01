import express, { Request, Response } from 'express'
import { Database } from '../db-utils'
import { ExerciseController } from '../controllers'

export default (db: Database) => {
  const router = express.Router({ strict: true })
  const controller = new ExerciseController(db)

  router.get('/', async (req: Request, res: Response) => {
    res.json(await controller.get_all())
  })

  router.get('/:key', async (req: Request, res: Response) => {
    const key = req.params.key.toUpperCase()
    const rows = await controller.get_by_key(key)
    if (rows.length === 0) {
      res.status(404).send('Not found')
    } else {
      res.json(rows[0])
    }
  })
  return router
}
