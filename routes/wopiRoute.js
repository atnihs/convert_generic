const express = require('express')
const router = express.Router()
const { DOMParser } = require('@xmldom/xmldom')
const xpath = require('xpath')
const axios = require('axios')

const { join } = require('path');
const { parseString } = require('xml2js')
const parser = require('xml2json')
const multer = require("multer");
const fs = require('fs')

router.get('/connectWopi', async (req, res) => {
    try {
        let hostName = req.query.server
        let url = hostName + '/hosting/discovery'

        const response = await axios.get(url)
        console.log(response.data)

        let { data } = response

        if (response.status !== 200) {
            let err = 'Request failed. Status Code: ' + response.status
            console.log(err)
            return res.status(response.status).send(err)
        }

        if (!response.data) {
            let err = 'No able to retrieve the discovery.xml file from the Collabora Online server with the submitted address.'
            console.log(err)
            return res.status(404).send(err)
        }

        let parser = new DOMParser()
        let doc = parser.parseFromString(data, 'text/xml')

        if (!doc) {
            let err = 'The retrieved discovery.xml file is not a valid XML file'
            console.log(err)
            return res.status(404).send(err)
        }

        let mimeType = 'text/plain'
        let nodes = xpath.select("/wopi-discovery/net-zone/app[@name='" + mimeType + "']/action", doc)

        if (!nodes || nodes.length !== 1) {
            let err = 'The requested mime type is not handled'
            console.log(err)
            return res.status(404).send(err)
        }

        let onlineUrl = nodes[0].getAttribute('urlsrc')
        res.json({
            url: onlineUrl,
            token: 'test'
        })
    } catch (e) {
        console.log("Error: ", e)
        res.status(404).send('Request error: ' + e);
    }
})

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads');
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});
const upload = multer({ storage: storage });

router.post('/upload', upload.single('file'), async (req, res) => {
    const file = req.file

    if (!file) {
        res.status(400).send('No file uploaded.')
        return
    }

    const fileStream = fs.createReadStream(file.path)
    const formData = new FormData()
    formData.append('file', fileStream)

    try {
        console.log({ formData })
        const response = await axios.post('http://localhost:9980/lool/convert-to/png', formData, {
            headers: formData.getHeaders()
        })
        res.send(response.data)
    } catch (error) {
        console.error('Error uploading file:', error);
        res.status(500).send('Error uploading file.');
    }
});


router.get('/files/:fileId', async (req, res) => {
    // console.log('file id: ' + req.params.fileId);
    // res.json({
    //     BaseFileName: join(__dirname, '..', 'test/Report-22042024.docx'),
    //     Size: 11,
    //     UserId: 1,
    //     UserCanWrite: true,
    //     EnableInsertRemoteImage: true,
    // });
    try {
        const response = await axios.post('http://10.8.86.99:9980/cool/convert-to/docx')


        const data = response

        console.log({ data })
        res.json({1: "Hello World"})
    } catch (e) {
        console.log("Error: ", e)
        res.status(404).send('Request error: ' + e);
    }
});

router.get('/getXmlData', async (req, res) => {
    try {
        const response = await fetch('http://10.8.86.99:9980/hosting/discovery');
        const xmlData = await response.text();

        const jsonData = parser.toJson(xmlData);

        res.json({ data: jsonData });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/files/:fileId/contents', (req, res) => {
    const fileContent = 'Hello world!';
    res.send(fileContent);
});

module.exports = router
