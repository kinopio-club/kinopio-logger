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

let logStart = moment().utc().format("MMM Do H.mma")
let logs = []

// start
const port = process.env.PORT || 3000
console.log('🔮 kinopio-logger localhost:' + port)
server.listen(port)

const startLoggingInterval = () => {
  if (logs.length) {
    // const buffer = { logStart, logs }
    console.log(typeof logs)
    const buffer = {
      Body: logs.toString(),
      Key: `${logStart}.log`,
      Bucket: process.env.BUCKET_NAME
    }
    console.log('🍆🍆🍆🍆🍆🍆🍆 upload to s3', typeof buffer.Body) // temp
    s3.putObject(buffer, (error, data) => {
      if (error) {
        console.error('🚒', error)
      } else {
        console.log(`🌹 ${buffer.Key} uploaded to ${buffer.Bucket}`)
      }
    })
  }
  logStart = moment().utc().format("MMM Do H.mma")
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
    console.log('🚛', log.message)
    logs.push({
      time: log.emitted_at,
      message: log.message
    })
  })
})

setInterval(() => {
  startLoggingInterval()
}, 20000) // -> process.env.DURATION 2 hours




// receive https drain messages from kinopio-server
  // add express that receives POST /message
    // GET / w standard server 200 message

// make a read stream to a file based on the day (eg Jul 1.log),
  // aws sdk may let me just append lines/updates to a file
// every hour update the day being uploaded to


// OR

// make a read stream to a local file
// every hour (interval),
  // upload the file
  // make a new file and stream into that
// when file upload complete, delete the file or clear the var
