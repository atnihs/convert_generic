const uploadService = require('../services/uploadService')
const handleResponse = require('../utils/responseMessage')

const convertData = async (req, res) => {
    if (req.body.jsonData) {
        const { jsonData } = req.body
        const isConvertData = await uploadService.convertString(jsonData)
        handleResponse(res, isConvertData, 201, 400)
    } else {
        const isConvertFile = await uploadService.convertFile(req)
        handleResponse(res, isConvertFile, 201, 400)
    }
}

module.exports = { convertData }