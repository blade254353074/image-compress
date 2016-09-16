var fileType = require('file-type')
var fs = require('fs')
var multiparty = require('multiparty')
var path = require('path')
var readChunk = require('read-chunk')

var uploadDir = path.resolve(process.cwd(), 'src/imgs/upload')
var maxFilesSize = 100 * 1000 * 1000 // 100MB

function uploadMiddleware (req, res) {
  return new Promise(function (resolve, reject) {
    var form = new multiparty.Form({
      maxFilesSize: maxFilesSize,
      uploadDir: uploadDir
    })

    form.on('error', function (err) {
      var error = new Error(err.message)
      error.status = err.statusCode
      reject(error)
    })

    form.parse(req, function (err, fields, files) {
      if (err) {
        err.message = 'Upload error，file size over limit (100MB).'
        return reject(err)
      }
      resolve(files)
    })
  })
}

function unlinkFile (filePath) {
  fs.unlink(filePath, function (err) {
    if (err) {
      throw (err)
    }
  })
}

function fileQualify (filePath, formats) {
  // https://github.com/sindresorhus/file-type
  var buffer = readChunk.sync(filePath, 0, 262)
  // var type = fileType(buffer)
  // if (formats.indexOf(type && type.ext) === -1) {
  //   unlinkFile(filePath)
  //   throw new Error('Upload error, wrong file type，just accept jpg, jpeg, gif, png.')
  // }
}

module.exports = function uploadMultiparty (req, res, next) {
  Promise.resolve()
    .then(function () {
      return uploadMiddleware(req, res)
    })
    .then(function (files) {
      if (!files.file) {
        throw new Error('Upload error, empty file field.')
      }
      return files.file[0]
    })
    .then(function (file) {
      const fileName = file.originalFilename
      const filePath = file.path // temporary file path
      fileQualify(filePath, ['jpg', 'png', 'gif'])
      return path.basename(filePath)
    })
    .then(function (filename) {
      res.send({
        path: '/imgs/upload/' + filename
      })
    })
    .catch(function (err) {
      err.status = err.status || 400
      next(err)
    })
}
