const handleResponse = (res, data, statusTrue, statusFalse) => {
    if (data.status) {
        res.status(statusTrue).json({ ...data })
    } else {
        res.status(statusFalse).json({ ...data })
    }
}

module.exports = handleResponse