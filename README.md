clone
deploy to heroku
settings → env values


// receive drain messages

// make a read stream to a file
// every hour (interval),
  // upload the file
  // make a new file and stream into that

// when file upload complete, delete the file



// receive https drain messages from kinopio-server
  // add express that receives POST /message
    // GET / w standard server 200 message


// make a read stream to a local file
// every hour (interval),
  // upload the file
  // make a new file and stream into that
// when file upload complete, delete the file or clear the var





http://HTTP_USER:HTTP_PASSWORD@localhost:8002

heroku drains:add https://HTTP_USER:HTTP_PASSWORD@logger.kinopio.club/ --app kinopio-server

accessible from https://logger.kinopio.club

p.s. You use this text filter in BBEdit or Terminal to make the logs easier to read

    #!/usr/bin/env bash
    # remove \s and add space between logs
    sed 's/\\//g; s/,{/,\n{/g'
