const express = require('express')
const router = express.Router()
const multer = require('multer');
const { join } = require('path');
const fs = require('fs');

const uploadDir = join(__dirname, '..', 'uploads');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname + '-' + Date.now());
    }
});

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

const upload = multer({ storage });

// const {} = require('../validators/uploadValidator')
const { convertFile } = require('../controllers/uploadController')

// router.route('/').get(getFile).post(createFile)
router.route('/').post(upload.single('jsonFile'), convertFile)

module.exports = router
