var express = require('express')
var router = express.Router()

router.post('/upload/multiparty', require('./upload-multiparty'))
router.post('/upload/multer', require('./upload-multer'))

module.exports = router
