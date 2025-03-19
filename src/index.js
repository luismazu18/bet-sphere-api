import express from 'express'
import helmet from 'helmet'
import { corsMiddleware } from './middleware/cors.js'
import logger from './util/logger.js'

const app = express()

app.use(helmet())

app.use(corsMiddleware)
// Preflight
app.options('*', corsMiddleware)

app.use(
  express.json({
    verify: (req, res, buf) => {
      req.rawBody = buf
    },
  })
)
app.use(
  express.urlencoded({
    extended: false,
    verify: (req, res, buf) => {
      req.rawBody = buf
    },
  })
)
app.use(
  express.raw({
    extended: false,
    verify: (req, res, buf) => {
      req.rawBody = buf
    },
  })
)

// healthCheck for AWS ELB
app.get('/healthCheck', function (req, res) {
  res.status(200).json({
    success: true,
    message: 'Service Running',
  })
})

// the default route should just be a 404 to minimize attack surface
app.get('/', function (req, res) {
  res.status(404).json({ error: 'Not Authorized' })
})

app.use(function (req, res) {
  res.status(404).json({ error: 'Not Authorized' })
})

app.use(function (err, req, res) {
  console.error(err.stack)
  res.status(500).json({ error: 'Server Error' })
})

const port = parseInt(process.env.PORT ?? 80, 10)
app.listen(port, () => {
  logger.info(`Listening Port: ${port}`)
})
