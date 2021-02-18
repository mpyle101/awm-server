import http from 'http'
import path from 'path'

import cors from 'cors'
import body_parser from 'body-parser'
import express, { Request, Response, NextFunction } from 'express'
import { pipe } from 'fp-ts/lib/pipeable'
import { Lazy } from 'fp-ts/lib/function'

import { Database, connect } from './utilities/db-utils'
import { foldMap, from_thunk } from './utilities/fp-utils'

import {
  create_blocks_router,
  create_cycles_router,
  create_exercises_router,
  create_sets_router,
  create_workouts_router
} from './routers'

let database: Database
const app = express()
const server = http.createServer(app)

// Parsers for POST data
app.use(cors())
app.use(body_parser.json())
app.use(body_parser.urlencoded({extended: false}))

// Point static path to public
app.use(express.static(path.join(__dirname, '../public')))

// Shutdown handling
const shutdown = () => {
  console.log('\nShutting down')
  server.close()
  database.$pool.end()
}
process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)


/**
 * Get connection parameters from environment and store in Express.
 */
const port = process.env.AWM_PORT || '9000'
const url  = process.env.AWM_DB || 'postgres://jester@localhost/awm';

(async () => {
  await (pipe(
    () => connect(url),
    result => from_thunk(result),
    foldMap(
      error => console.log(`Failed to connect to database: ${error}`),
      ({ db, version }) => {
        console.log(`Connected to Postgres:`, version)
        database = db

        // app.use((req, res, next) => setTimeout(next, 1000))

        app.use('/api', (req, res, next: NextFunction) => {
            console.log(req.originalUrl)
            next()
        })

        // Set our api routes
        app.use('/api/blocks',    create_blocks_router(db))
        app.use('/api/cycles',    create_cycles_router(db))
        app.use('/api/exercises', create_exercises_router(db))
        app.use('/api/sets',      create_sets_router(db))
        app.use('/api/workouts',  create_workouts_router(db))

        // Catch all other routes and return the index file
        app.get('*', (req: Request, res: Response) => {
            res.sendFile(path.join(__dirname, '../public/index.html'))
        })

        app.use((err, req: Request, res: Response, next: NextFunction) => {
          res.status(err.status).json({
            status: err.status,
            message: err.message,
            ...err.error ? { error: err.error.toString() } : {}
          })
        })

        // Listen on provided port, on all network interfaces.
        server.listen(port, () => console.log(`Server running on localhost:${port}`)) 
      }
    )
  ))()
})()
