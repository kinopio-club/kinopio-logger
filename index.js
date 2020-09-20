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
import AWS from 'aws-sdk'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
dayjs.extend(utc)

let logStart = ''
let logs = []
let errorLogStart = ''
let errorLogs = []

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
      Body: JSON.stringify(logs, null, 2), // spacing level = 2,
      Key: `${logStart}.log`,
      Bucket: process.env.BUCKET_NAME
    }
    s3.putObject(buffer, (error, data) => {
      if (error) {
        console.error('🚒', error)
      } else {
        console.log('🌷🌷🌷🌷🌷🌷🌷🌷🌷🌷🌷🌷🌷🌷🌷🌷🌷🌷🌷🌷🌷🌷🌷')
        console.log(`🌷 ${buffer.Key} uploaded to ${buffer.Bucket} 🌷`)
        console.log('🌷🌷🌷🌷🌷🌷🌷🌷🌷🌷🌷🌷🌷🌷🌷🌷🌷🌷🌷🌷🌷🌷🌷')
      }
    })
  }
  logStart = dayjs.utc().format("MMM D h A")
  console.log('⏰ new logging interval:', logStart)
  logs = []
}

const startErrorLoggingInterval = () => {
  const isExistingLogs = errorLogs.length
  if (isExistingLogs) {
    const buffer = {
      Body: JSON.stringify(errorLogs, null, 2), // spacing level = 2,
      Key: `Errors – ${errorLogStart}.log`,
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
  errorLogStart = dayjs.utc().format("MMM D h A")
  console.log('⏰ new error logging interval:', errorLogStart)
  errorLogs = []
}

startLoggingInterval()
startErrorLoggingInterval()

const shouldExclude = (message) => {
  if (typeof message !== 'string') { return }
  const excludeStrings = [
    "sql_error_code = 00000"
  ]
  const shouldExclude = excludeStrings.find(excludeString => {
    return message.includes(excludeString)
  })
  return Boolean(shouldExclude)
}

const shouldExcludeFromErrors = (message) => {
  if (typeof message !== 'string') { return }
  const excludeStrings = [
    "Error L10 (output buffer overflow)"
  ]
  const shouldExclude = excludeStrings.find(excludeString => {
    return message.includes(excludeString)
  })
  return Boolean(shouldExclude)
}

const isError = (message) => {
  if (typeof message !== 'string') { return }
  const errorStrings = [
    'error',
    'violation',
    '🚒'
  ]
  const isError = errorStrings.find(errorString => {
    return message.toLowerCase().includes(errorString)
  })
  return Boolean(isError)
}

app.get('/', async (request, response) => {
  console.log('🌱')
  response.json({
    message: `${process.env.LOGGER_APP_NAME} is online`,
    docs: 'https://github.com/kinopio-club/kinopio-logger'
  })
})

app.post('/', async (request, response) => {
  const parsedMessage = herokuLogParser.parse(request.body)
  response.set({ 'Content-Length': '0' })
  response.status(200).end()
  parsedMessage.forEach(log => {
    let message = log.message.msg || log.message
    try {
      message = JSON.parse(message)
    } catch (error) {
      message = message
    }
    if (shouldExclude(message)) { return }
    const time = dayjs(log.emitted_at).utc().format('hh:mma')
    delete message.level
    delete message.time
    delete message.pid
    delete message.hostname
    const logData = { time, message }
    let emoji = '🦜'
    logs.push(logData)
    if (isError(message)) {
      if (!shouldExcludeFromErrors(message)) {
        errorLogs.push(logData)
      }
      emoji = '🚒'
    }
    console.log(emoji, message)
  })
})

setInterval(() => {
  startLoggingInterval()
  startErrorLoggingInterval()
}, process.env.DURATION || 3600000) // every hour
