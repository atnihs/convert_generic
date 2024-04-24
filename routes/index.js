const express = require('express');
const router = express.Router();
const uploadRoute = require('./uploadRoute');

router.use('/upload', uploadRoute);

module.exports = router;
