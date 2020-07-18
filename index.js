// enable es6 module imports
require = require("esm")(module) // eslint-disable-line no-global-assign
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

import express from 'express'
import http from 'http'
import compression from 'compression'
import basicAuth from 'express-basic-auth'
import bodyParser from 'body-parser'
import herokuLogParser from 'heroku-log-parser'
import moment from 'moment'
import AWS from 'aws-sdk'

const app = express()
app.use(compression())
app.use(basicAuth({
    users: { [process.env.HTTP_USER]: process.env.HTTP_PASSWORD },
    challenge: true
}))
app.use(bodyParser.text({type: 'application/logplex-1'}))
const server = http.createServer(app)

const endpoint = new AWS.Endpoint(process.env.S3_ENDPOINT)
AWS.config.update({
  accessKeyId: process.env.S3_ACCESS_KEY,
  secretAccessKey: process.env.S3_SECRET_KEY,
  endpoint: endpoint
})
const s3 = new AWS.S3()

let logStart = ''
let logs = []

// start
const port = process.env.PORT || 3000
console.log('🔮 kinopio-logger localhost:' + port)
server.listen(port)

const startLoggingInterval = () => {
  if (logs.length) {
    const buffer = {
      Body: JSON.stringify(logs),
      Key: `${logStart}.log`,
      Bucket: process.env.BUCKET_NAME
    }
    s3.putObject(buffer, (error, data) => {
      if (error) {
        console.error('🚒', error)
      } else {
        console.log(`🌹 ${buffer.Key} uploaded to ${buffer.Bucket}`)
      }
    })
  }
  logStart = moment().utc().format("MMM Do h A")
  console.log('🌱 new logging interval:', logStart)
  logs = []
}

startLoggingInterval()

app.get('/', async (request, response) => {
  console.log('🌱')
  response.json({
    message: 'kinopio-logger is online',
    docs: 'https://github.com/kinopio-club/kinopio-logger'
  })
})

app.post('/', async (request, response) => {
  const parsedMessage = herokuLogParser.parse(request.body)
  response.set({ 'Content-Length': '0' })
  response.status(200).end()
  parsedMessage.forEach(log => {
    console.log('🚛', log.message.msg || log.message)
    logs.push({
      time: log.emitted_at,
      message: log.message
    })
  })
})

setInterval(() => {
  startLoggingInterval()
}, process.env.DURATION || 3600000) // every hour
