const uploadService = require('../services/uploadService')
const handleResponse = require('../utils/responseMessage')

const convertFile = async (req, res) => {
    console.log({ 1: req })
    handleResponse(res, {}, 201, 400)
}

module.exports = { convertFile }