const { RESPONSE} = require('../constants')
// const { Parser } = require('@json2csv/plainjs')
const {join} = require("path")
const fs = require("fs")
const xlsx = require('xlsx')

const convertString = async (data) => {
    try {
        let msg;
        let parsedData;
        if (typeof data !== 'string') {
            return {status: false, message: RESPONSE.MESSAGE.INVALID_DATA_TYPE}
        }

        try {
            parsedData = JSON.parse(data);
            const extractData = await handleData(parsedData.data.hits.hits)

            const uploadDir = join(__dirname, '..', 'uploads/xlsx')
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true})
            }

            msg = await createExcel(extractData, uploadDir)
        } catch (err) {
            console.log({message: err})
            return {status: false, message: RESPONSE.MESSAGE.INVALID_JSON_FORMAT}
        }

        return msg;
    } catch (error) {
        console.error(error)
        return {status: false, message: RESPONSE.MESSAGE.UNKNOWN_ERROR};
    }
}

const handleData = async (array) => {
    const mappedData = {};
    array.forEach(item => {
        if (!mappedData[item.source.entity]) {
            const parseProps = parseDisplaySearchProperties(item.source.displaySearchProperties)
            mappedData[item.source.entity] = [{
                id: item.source.id,
                displayName: item.source.displayName,
                entity: item.source.entity,
                dataSource: item.source.dataSource,
                createDate: item.source.createDate,
                updateDate: item.source.updateDate,
                ...parseProps
            }]
        } else {
            const parseProps = parseDisplaySearchProperties(item.source.displaySearchProperties)
            mappedData[item.source.entity].push({
                id: item.source.id,
                displayName: item.source.displayName,
                entity: item.source.entity,
                dataSource: item.source.dataSource,
                createDate: item.source.createDate,
                updateDate: item.source.updateDate,
                ...parseProps
            })
        }
    })
    return mappedData;
}

function parseDisplaySearchProperties(displaySearchProperties) {
    const data = {}
    displaySearchProperties.forEach(property => {
        data[property.propertyName] = property.propertyValue.length > 0 ? property.propertyValue.join(",") : null;
    });
    return data
}

const createExcel = async(data, uploadDir) => {
    try {
        const workbook = await xlsx.utils.book_new()

        for (const type in data) {
            if (data.hasOwnProperty(type)) {
                const fields = Object.keys(data[type][0])
                const entityData = data[type]
                const entityName = type.split('.')[2]
                const dataSheet = []
                dataSheet.push(fields)

                entityData.forEach(item => {
                    const row = []
                    fields.forEach(field => {
                        row.push(item[field])
                    })
                    dataSheet.push(row)
                })

                const ws = xlsx.utils.aoa_to_sheet(dataSheet)

                fields.forEach((field, index) => {
                    ws['!cols'] = ws['!cols'] || []
                    switch (index) {
                        case 0:
                            ws['!cols'][index] = { wch: 40 }
                            break
                        case 4:
                        case 5:
                            ws['!cols'][index] = { wch: 30 }
                            break
                        default: ws['!cols'][index] = { wch: 20 }
                    }
                })

                xlsx.utils.book_append_sheet(workbook, ws, entityName)
            }
        }
        xlsx.writeFile(workbook, join(uploadDir, `${Date.now()}.xlsx`));
        return {status: true, message: RESPONSE.MESSAGE.CREATE_SUCCESS}
    } catch (err) {
        console.log({message: err})
    }
}

function isJSON(content) {
    try {
        let data = JSON.parse(content);
        return { isChecked: true, data };
    } catch (e) {
        return { isChecked: false };
    }
}

const convertFile = async (req) => {
    let msg;
    try {
        const { mimetype, path } = req.file;
        if (!fs.existsSync(path) || mimetype !== 'application/json') {
            return { status: false, message: RESPONSE.MESSAGE.INVALID_DATA_TYPE }
        }

        const fileContent = fs.readFileSync(path, 'utf-8')

        if (!isJSON(fileContent).isChecked) {
            return { status: false, message: RESPONSE.MESSAGE.INVALID_JSON_FORMAT}
        }


        const extractData = await handleData(isJSON(fileContent).data.data.hits.hits)

        const uploadDir = join(__dirname, '..', 'uploads/xlsx');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true});
        }

        try {
            msg = await createExcel(extractData, uploadDir)
        } catch (err) {
            console.log({message: err})
        }
    } catch (error) {
        console.error(error)
        return { status: false, message: RESPONSE.MESSAGE.UNKNOWN_ERROR};
    }
    return msg;
}

module.exports = {
    convertString,
    convertFile
}