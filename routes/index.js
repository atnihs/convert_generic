const express = require('express')
const router = express.Router()
const uploadRoute = require('./uploadRoute')
const wopiRoute = require('./wopiRoute')

router.use('/upload', uploadRoute)
router.use('/wopi', wopiRoute)

module.exports = router
