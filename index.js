// enable es6 module imports
require = require("esm")(module) // eslint-disable-line no-global-assign

import herokuLogParser from 'heroku-log-parser'
import fs from 'fs'
import moment from 'moment'
import S3 from 'aws-sdk/clients/s3'

let incomingMessage = "156 <40>1 2012-11-30T06:45:26+00:00 heroku web.3 d.73ea7440-270a-435a-a0ea-adf50b4e5f5a - Starting process with command `bundle exec rackup config.ru -p 24405`"
let parsedMessage = herokuLogParser.parse(incomingMessage)

const newFileName = () => {
 const timeStamp = moment().utc().format("MMM D - h mma")
 return `${timeStamp}.txt`
}

console.log(parsedMessage)
console.log('🍄', newFileName())
console.log(parsedMessage[0].emitted_at, parsedMessage[0].message)



// receive drain messages

// make a read stream to a file
// every hour (interval),
  // upload the file
  // make a new file and stream into that

// when file upload complete, delete the file