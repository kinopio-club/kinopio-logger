// enable es6 module imports
require = require("esm")(module) // eslint-disable-line no-global-assign
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

import express from 'express'
import http from 'http'
import compression from 'compression'
// import basicAuth from 'express-basic-auth'
import herokuLogParser from 'heroku-log-parser'
import fs from 'fs'
import moment from 'moment'
import S3 from 'aws-sdk/clients/s3'

const app = express()
app.use(compression())
// app.use(basicAuth({
//     users: { [process.env.HTTP_USER]: process.env.HTTP_PASSWORD },
//     challenge: true
// }));
const server = http.createServer(app)

let logs = []
let timeRangeStart

// start
const port = process.env.PORT || 3000
console.log('🔮 kinopio-logger localhost:' + port)
server.listen(port)

// const auth = (request, response, next) => {
//   const user = basicAuth(request)
//   if (!user || !user.name || !user.pass || user.name !== process.env.HTTP_USER || user.pass !== process.env.HTTP_PASSWORD) {
//     response.set('WWW-Authenticate', 'Basic realm="Authorization required"');
//     return response.status(401).send()
//   } else {
//     next()
//   }
// }


const newTimeRange = () => {
 timeRangeStart = moment().utc().format("MMM Do H.mma")
}

app.get('/', async (request, response) => {
  console.log('🌱')
  response.json({
    message: 'kinopio-logger is online',
    docs: 'https://github.com/kinopio-club/kinopio-logger'
  })
})

app.post('/', async (request, response) => {
  console.log('🌸',request.body)
  response.set({
    'Content-Length': '0',
  })
  response.sendStatus(200)
})

// test
let incomingMessage = "156 <40>1 2012-11-30T06:45:26+00:00 heroku web.3 d.73ea7440-270a-435a-a0ea-adf50b4e5f5a - Starting process with command `bundle exec rackup config.ru -p 24405`"
let parsedMessage = herokuLogParser.parse(incomingMessage)


// in post
newTimeRange()
console.log('🌷', `${timeRangeStart}.log`)
logs.push({
  time: parsedMessage[0].emitted_at,
  message: parsedMessage[0].message
})
console.log(logs)





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


