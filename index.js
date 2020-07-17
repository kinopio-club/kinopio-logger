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
import fs from 'fs'
import moment from 'moment'
import S3 from 'aws-sdk/clients/s3'

const app = express()
app.use(compression())
app.use(basicAuth({
    users: { [process.env.HTTP_USER]: process.env.HTTP_PASSWORD },
    challenge: true
}))
app.use(bodyParser.text({type: 'application/logplex-1'}))
const server = http.createServer(app)

let logFile = ''
let logs = []

// start
const port = process.env.PORT || 3000
console.log('🔮 kinopio-logger localhost:' + port)
server.listen(port)

const initLoggingInterval = () => {
 const timeRangeStart = moment().utc().format("MMM Do H.mma")
 console.log(logFile, logs)
 // ... if logs.length , upload to s3 here (not sync) ...
 logFile = `${timeRangeStart}.log`
 logs = []
 console.log('🌷', logFile.length) // Jul 17th 17.10pm.log
}

// const normalizeMessage = (message) => {
  // console.log(message)
  // if (!message.msg) {
  //   console.log('🥬', typeof(message), message.msg)
  //   return message
  // }
//   message.msg = message.msg.replaceAll('\"', "'")
// console.log('👘👘👘👘👘',message.msg)
//   return message
// }

initLoggingInterval()

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
    // const message = normalizeMessage(log.message)
    // if (log.message) {
    // console.log('🍆', log.message.msg)
    // log.message.msg = log.message.msg.replaceAll('\"', "'")
    // }
    console.log('🌸', typeof log.message, log.message, log.message.msg)
    logs.push({
      time: log.emitted_at,
      message: log.message
    })
  })
})

setInterval(() => {
  initLoggingInterval()
}, 5000) // -> process.env.INTERVAL




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
