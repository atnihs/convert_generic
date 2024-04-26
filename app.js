const express = require('express')
const cookieParser = require('cookie-parser')
const logger = require('morgan')
require('dotenv').config()
const routes = require('./routes')
const app = express()
const bodyParser = require('body-parser')
const server = require('http').Server(app)
const cors = require('cors')
const { join} = require('path')


app.use(cors())
app.use(logger('dev'))
app.use(express.urlencoded({ extended: false }))
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static('public'))
app.use(express.static(join(__dirname, '..', 'html')))

app.get('/upload', (req, res) => {
    res.sendFile(join(__dirname, 'public', 'upload.html'));
});

app.use('/api/v1', routes)

app.get('/', (req, res) => {
    res.send( "Hello World")
})

const errorHandler = (err, req, res, next) => {
    res.status(err.status || 500)
    res.json({
        error: {
            message: err.message,
        },
    })
}

app.use(express.json())
app.use(errorHandler)

const port = process.env.APP_PORT
const address = process.env.APP_ADDRESS

server.listen(port, address, () => {
    console.log(`Server listening on http://localhost:${port}`)
})