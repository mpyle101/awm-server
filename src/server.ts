import http from 'http'
import path from 'path'

import cors from 'cors'
import body_parser from 'body-parser'
import express from 'express'

import { pipe } from 'fp-ts/lib/pipeable'
import { fold } from 'fp-ts/lib/Either'

import { connect } from './db-utils'
import { tryCatch } from './utils'

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
}
process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)


/**
 * Get connection parameters from environment and store in Express.
 */
const port = process.env.AWM_PORT || '9000'
const url  = process.env.AWM_DB || 'postgres://jester@localhost/awm';

(async () => {
  pipe(
    await tryCatch(() => connect(url)),
    fold(
      err => console.log(`Failed to connect to database: ${err}`),
      async ({ db, version }) => {
        console.log(`Connected to Postgres:`, version)

        // app.use((req, res, next) => setTimeout(next, 1000))

        app.use('/api', (req, res, next) => {
            console.log(req.originalUrl)
            next()
        })

        // Set our api routes
        // const router = require('./routes')(db)
        // app.use('/api', router)

        // Catch all other routes and return the index file
        app.get('*', (req, res) => {
            res.sendFile(path.join(__dirname, '../public/index.html'))
        })

        app.use((err, req, res, next) => {
            res.status(err.status || 500)
            if (err.status == 404) {
                res.send('Not found')
            } else {
                res.json({
                    message: err.message,
                    error: err.error.toString()
                })
            }
        })

        // Listen on provided port, on all network interfaces.
        server.listen(port, () => console.log(`Server running on localhost:${port}`)) 
      }
    )
  )
})()
