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

let logStart = ''
let logs = []

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

// start
const port = process.env.PORT || 3000
console.log(`🔮 ${process.env.LOGGER_APP_NAME} localhost: ${port}`)
server.listen(port)

const startLoggingInterval = () => {
  const isExistingLogs = logs.length
  if (isExistingLogs) {
    const buffer = {
      Body: logs, // JSON.stringify(logs, null, 2), // spacing level = 2,
      Key: `${logStart}.log`,
      Bucket: process.env.BUCKET_NAME
    }
    s3.putObject(buffer, (error, data) => {
      if (error) {
        console.error('🚒', error)
      } else {
        console.log('🌹🌹🌹🌹🌹🌹🌹🌹🌹🌹🌹🌹🌹🌹🌹🌹🌹🌹🌹🌹🌹🌹🌹')
        console.log(`🌹 ${buffer.Key} uploaded to ${buffer.Bucket} 🌹`)
        console.log('🌹🌹🌹🌹🌹🌹🌹🌹🌹🌹🌹🌹🌹🌹🌹🌹🌹🌹🌹🌹🌹🌹🌹')
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
    message: `${process.env.LOGGER_APP_NAME} is online`,
    docs: 'https://github.com/kinopio-club/kinopio-logger'
  })
})

app.post('/', async (request, response) => {
  const parsedMessage = herokuLogParser.parse(request.body)
  const excludeStrings = [
    "sql_error_code = 00000"
  ]
  response.set({ 'Content-Length': '0' })
  response.status(200).end()
  parsedMessage.forEach(log => {
    const message = log.message.msg || log.message
    let shouldExclude
    excludeStrings.forEach(excludeString => {
      if (message.includes(excludeString)) {
        shouldExclude = true
      }
    })
    if (shouldExclude) { return }
    delete message.level
    delete message.time
    delete message.pid
    delete message.hostname
    console.log('🐢', message)
    logs.push({
      time: moment(log.emitted_at).utc().format('hh:mma'),
      message
    })
  })
})

setInterval(() => {
  startLoggingInterval()
}, process.env.DURATION || 3600000) // every hour
