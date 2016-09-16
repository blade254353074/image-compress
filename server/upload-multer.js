var fileType = require('file-type')
var fs = require('fs')
var multer = require('multer')
var path = require('path')
var readChunk = require('read-chunk')
var shortid = require('shortid')

var uploadDir = path.resolve(process.cwd(), 'src/imgs/upload')
var maxFilesSize = 100 * 1000 * 1000 // 100MB
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir)
  },
  filename: function (req, file, cb) {
    var mimetype = file.mimetype
    cb(null, shortid.generate() + '.' + mimetype.substr(mimetype.lastIndexOf('/') + 1))
  }
})
var upload = multer({
  storage: storage,
  limits: {
    fieldSize: maxFilesSize
  }
})

function fileQualify (filePath, formats) {
  // https://github.com/sindresorhus/file-type
  var buffer = readChunk.sync(filePath, 0, 262)
  var type = fileType(buffer)
  if (formats.indexOf(type && type.ext) === -1) {
    unlinkFile(filePath)
    throw new Error('Upload error, wrong file type，just accept jpg, jpeg, gif, png.')
  }
}

function unlinkFile (filePath) {
  fs.unlink(filePath, function (err) {
    if (err) {
      throw (err)
    }
  })
}

function uploadMiddleware (req, res) {
  return new Promise(function (resolve, reject) {
    var uploader = upload.single('file')
    uploader(req, res, function (err) {
      if (err) {
        reject(err)
      }
      resolve(req, res)
    })
  })
}

module.exports = function uploadMulter (req, res, next) {
  Promise.resolve()
    .then(function () {
      return uploadMiddleware(req, res)
    })
    .then(function (req, res) {
      if (req.file) {
        fileQualify(req.file.path, ['jpg', 'png', 'gif'])
      } else {
        throw new Error('Upload error, empty file field.')
      }
    })
    .then(function () {
      res.send({
        path: '/imgs/upload/' + req.file.filename
      })
    })
    .catch(function (err) {
      err.status = err.status || 400
      next(err)
    })
}
