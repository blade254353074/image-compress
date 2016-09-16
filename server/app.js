var bodyParser = require('body-parser')
var cookieParser = require('cookie-parser')
var cors = require('cors')
var express = require('express')
var log4js = require('log4js')
var path = require('path')

var logger = log4js.getLogger('app')
var httpLogger = log4js.connectLogger(log4js.getLogger('http'), { level: 'auto' })
var app = express()

app.use(httpLogger)
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(cors({
  origin: function (origin, callback) {
    callback(null, true)
  },
  credentials: true
}))
app.use(express.static(path.resolve(__dirname, '../src')))

app.use('/api', require('./api'))

// catch 404 and forward to error handler
app.use((req, res, next) => {
  var err = new Error('Not Found')
  err.status = 404
  next(err)
})

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use((err, req, res, next) => {
    var status = err.status || 500
    logger.error(err)
    res.status(status)
    res.send({
      message: err.message,
      status,
      stack: err.stack
    })
  })
}

// production error handler
// no stacktraces leaked to user
app.use((err, req, res, next) => {
  var status = err.status || 500
  logger.error(err)
  res.status(status)
  res.send({
    error: {
      message: err.message,
      status
    }
  })
})

module.exports = app
