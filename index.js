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

let logs = []
let logFile = ''

// start
const port = process.env.PORT || 3000
console.log('🔮 kinopio-logger localhost:' + port)
server.listen(port)

const newTimeRange = () => {
 const timeRangeStart = moment().utc().format("MMM Do H.mma")
 // ... upload to s3 here (not sync) ...
 logFile = `${timeRangeStart}.log`
 logs = []
 console.log('🌷', logFile) // Jul 17th 17.10pm.log
}

const normalizeMessage = (message) => {
  if (!message.msg) { return message }
  message.msg = message.msg.replaceAll('\"', '')
  return message
}

newTimeRange()

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
    // if (!log.message.includes('Error L10')) {
      console.log('🌸', normalizeMessage(log.message))
      logs.push({
        time: log.emitted_at,
        message: normalizeMessage(log.message)
      })
    // }
  })

  // if (parsedMessage[0].message.includes('Error L10')) { return }
  // const log = {
  //   time: parsedMessage[0].emitted_at,
  //   message: parsedMessage[0].message
  // }
  // logs.push(log)
})

setInterval(() => {
  newTimeRange()
}, 3000) // -> process.env.INTERVAL


// test
// let incomingMessage = "156 <40>1 2012-11-30T06:45:26+00:00 heroku web.3 d.73ea7440-270a-435a-a0ea-adf50b4e5f5a - Starting process with command `bundle exec rackup config.ru -p 24405`"
// let parsedMessage = herokuLogParser.parse(incomingMessage)


// in post
// logs.push({
//   time: parsedMessage[0].emitted_at,
//   message: parsedMessage[0].message
// })
// console.log(logs)





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



// when file upload complete, delete the file


