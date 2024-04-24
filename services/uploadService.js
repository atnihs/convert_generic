const { RESPONSE } = require('../constants')

const convertFile = async (body) => {
    try {
        const { data } = body
        if (typeof data !== 'object' || Array.isArray(data)) {
            return { status: false, message: RESPONSE.MESSAGE.INVALID_DATA}
        }
        return { status: true, message: data }
    } catch (error) {
        console.error(error)
    }
}

module.exports = {
    convertFile
}