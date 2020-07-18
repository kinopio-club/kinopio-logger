# Kinopio Logger

<img src="https://kinopio-updates.us-east-1.linodeobjects.com/logger-diagram.png" width=500 />

Receives [logs](https://devcenter.heroku.com/articles/log-drains) from a Heroku app, and periodically saves them to S3. Helpful for diagnosing errors in your Heroku metrics.

- Simpler and cheaper than a commercial logging service (Logstash, Timber etc.)
- Supports saving to any S3 service: Digital Ocean, Linode, etc.

# Install

You'll need the [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli)

1. Fork then clone this repo
2. Create a new app on Heroku, and connect your repo to it
3. Configure (see below)
4. Connect your logger to the app you want to log (i.e. SOURCE_APP) 
``` 
$ heroku drains:add https://HTTP_USER:HTTP_PASSWORD@LOGGER_APP_NAME.herokuapp.com/ --app SOURCE_APP
```
5. Run and verify that it works

# Configure

Local: Rename `.env.sample` to `.env`

Production: Heroku dashboard → Settings → Config Vars

## ENV Variables

env variables - table

name[optional] description

| Variable | Description | Example |
|:--|:--|:--|
| LOGGER_APP_NAME | The name of your logger app on heroku | app-logger |
| DURATION (optional) | The period of time each log file should cover. Default is 1 hour | 3600000 |
| HTTP_USER | The logger uses simple authentication to ensure only your source app can send logs to it | string |
| HTTP_PASSWORD | Simple authentication password | string |
| S3_ACCESS_KEY | Your S3 Access Key | string |
| S3_SECRET_KEY | Your S3 Secret Key | string |
| S3_ENDPOINT | The endpoint for the S3 service/region you want to use (see below) | https://s3.us-east-1.amazonaws.com |
| BUCKET_NAME | The name of the S3 bucket to save in | app-logs |
| PORT (optional) | Override the port used for localhost development | 3000 |

## S3_ENDPOINT

You can configure this logger to save log files to any S3 service. Some popular examples,

| Service | URL Format | Example |
|:--|:--|:--|
| AWS S3 | `s3.<region>.amazonaws.com` | `https://s3.eu-west-1.amazonaws.com` |
| Digital Ocean Spaces | `<region>.digitaloceanspaces.com` | `https://nyc3.digitaloceanspaces.com` |
| Linode Object Storage | `<region>.linodeobjects.com` | `https://us-east-1.linodeobjects.com` |
| Backblaze B2 | `s3.<region>.backblazeb2.com` | `s3.us-west-002.backblazeb2.com` |



# Run and Verify

## Testing Locally

    $ npm run serve

Browsing to `http://localhost:PORT` should prompt you for your `HTTP_USER` and `HTTP_PASSWORD`

## Testing Production

Verify that the logger is running and receiving logs

    $ heroku logs --tail --source app --app LOGGER_APP_NAME

🎊 Hourly log files should now start to appear in your S3 bucket!

p.s. You use this text filter in BBEdit or Terminal to make the logs easier to read and parse

    #!/usr/bin/env bash
    # remove backslashes; add space between logs; remove quotes around brackets; remove useless data
    sed 's/\\//g; s/,{/,\n{/g; s/"{"/{/g; s/}"/}/g; s/"}/}/g; s/,"v":1//g; s/"}/}/g;'

<img src="https://kinopio-updates.us-east-1.linodeobjects.com/leaves.png" width=60/>

# Pull Requests Welcome

Suggestion,

- [ ] Create a ['Deploy to Heroku'](https://devcenter.heroku.com/articles/heroku-button) Button
