const express = require('express')
const router = express.Router()
const { DOMParser } = require('@xmldom/xmldom')
const xpath = require('xpath')
const http = require('http')
const https = require('https')
const axios = require('axios')

const { join } = require('path');
const { parseString } = require('xml2js')
const parser = require('xml2json')

router.get('/collaboraURL', (req, res) => {
    let hostName = req.query.server
    let httpClient = hostName.startsWith('https') ? https : http
    let data = ''

    httpClient.get(hostName + '/hosting/discovery', (response) => {
        response.on('data', (chunk) => data += chunk.toString())
        response.on('end', () => {
            if (response.statusCode !== 200) {
                let err = 'Request failed. Satus Code: ' + response.statusCode;
                response.resume();
                res.status(response.statusCode).send(err);
                console.log(err)
                return;
            }
            if (!response.complete) {
                let err = 'No able to retrieve the discovery.xml file from the Collabora Online server with the submitted address.';
                res.status(404).send(err);
                console.log(err);
                return;
            }
            let doc = new DOMParser().parseFromString(data);
            if (!doc) {
                let err = 'The retrieved discovery.xml file is not a valid XML file'
                res.status(404).send(err)
                console.log(err);
                return;
            }
            let mimeType = 'text/plain';
            let nodes = xpath.select("/wopi-discovery/net-zone/app[@name='" + mimeType + "']/action", doc);
            if (!nodes || nodes.length !== 1) {
                let err = 'The requested mime type is not handled'
                res.status(404).send(err);
                console.log(err);
                return;
            }
            let onlineUrl = nodes[0].getAttribute('urlsrc');
            res.json({
                url: onlineUrl,
                token: 'test'
            });
        })
        response.on('error', (err) => {
            res.status(404).send('Request error: ' + err);
            console.log('Request error: ' + err.message);
        });
    })
})

router.get('/files/:fileId', (req, res) => {
    console.log('file id: ' + req.params.fileId);
    res.json({
        BaseFileName: join(__dirname, '..', 'test/Report-22042024.docx'),
        Size: 11,
        UserId: 1,
        UserCanWrite: true,
        EnableInsertRemoteImage: true,
    });
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
