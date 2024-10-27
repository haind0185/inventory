import moment from 'moment'

const functions = {
    format_number: (value, decimals, currency ) => {
        value = parseFloat(value)
        if (!isFinite(value) || (!value && value !== 0)) return ''
        currency = currency != null ? currency : ''
        decimals = decimals != null ? decimals : 0
        var stringified = Math.abs(value).toFixed(decimals)
        var _int = decimals ? stringified.slice(0, -1 - decimals) : stringified
        var i = _int.length % 3
        var head = i > 0 ? _int.slice(0, i) + (_int.length > 3 ? ',' : '') : ''
        var _float = decimals ? stringified.slice(-1 - decimals) : ''
        var sign = value < 0 ? '-' : ''
        return sign + currency + head + _int.slice(i).replace(/(\d{3})(?=\d)/g, '$1,') + _float
    },
    onlyNumber: (value) => {
        if (!value) return value
        return (value = value.toString().replace(/[^0-9]/g, ''))
    },
    typeText: (arr, value, key_text = null, value_text = null) => {
        let result = ''
        key_text = key_text == null ? 'id' : key_text
        value_text = value_text == null ? 'value' : value_text
        arr.forEach((element) => {
            if (element[key_text] == value) {
                result = element[value_text]
                return
            }
        })
        return result
    },
    monthToDate: (data, to = false, format = 'YYYY-MM-DD') => {
        if (!data) return null
        if (to) return moment(data).endOf('month').format(format)
        return moment(data).startOf('month').format(format)
    },
    dateToMonth: (string) => {
        if (typeof string === 'object') return string
        if (!string) {
            return null
        }
        let date = new Date(string)
        return { year: date.getFullYear(), month: date.getMonth() }
    },
    timeToTimeStr: (data) => {
        if (!data) return null
        if (typeof data !== 'object') return data
        return data.hours + ':' + data.minutes + ':' + data.seconds
    },
    timeStrToTime: (string) => {
        if (typeof string === 'object') return string
        if (!string) {
            return null
        }
        let date = new Date('01/01/1970 ' + string)
        return { hours: date.getHours(), minutes: date.getMinutes(), seconds: date.getSeconds() }
    },
    timeToString: (object, format = 'YYYY-MM-DD') => {
        if (!object || typeof object !== 'object') return object
        return moment(object).format(format)
    },
    displayDate: (date, replace = '-', format = 'YYYY/MM/DD') => {
        moment.updateLocale('en', {
            weekdaysShort: '日_月_火_水_木_金_土'.split('_'),
        })
        if (!date) return replace
        if (typeof date !== 'object') date = new Date(date)
        const result = moment(date).format(format)
        return result === 'Invalid date' ? replace : result
    },
    date: (date, replace = null, format = 'DD-MM-YYYY') => {
        if (!date) return replace
        if (typeof date !== 'object') date = new Date(date)
        const result = moment(date).format(format)
        return result === 'Invalid date' ? replace : result
    },
    mapPayload: (object_1, object_2) => {
        for (const key in { ...object_1 }) {
            if (Object.hasOwn(object_2, key)) {
                object_1[key] = object_2[key]
            }
        }
        return object_1
    },
    textNull: (object) => {
        for (const key in { ...object }) {
            if (object[key] === '') {
                object[key] = null
            }
        }
        return object
    },
    formatBeforeRequest: (object) => {
        for (const key in { ...object }) {
            if (typeof object[key] === 'object' && typeof object[key]?.['getFullYear'] === 'function') {
                object[key] = timeToString(object[key])
            }
            if (
                typeof object[key] === 'object' &&
                (object[key]?.['month'] || object[key]?.['month'] == 0) &&
                object[key]?.['year']
            ) {
                object[key] = monthToDate(object[key])
            }
            if (
                typeof object[key] === 'object' &&
                (object[key]?.['hours'] || object[key]?.['hours'] == 0) &&
                (object[key]?.['minutes'] || object[key]?.['minutes'] == 0)
            ) {
                object[key] = timeToTimeStr(object[key])
            }
            if (typeof object[key] === 'string' && object[key].substr(0, 11).match(/\d{4}-\d{2}-\d{2}T/)) {
                object[key] = object[key].substr(0, 10)
            }
        }
        return object
    },
    deepClone: (object) => {
        return JSON.parse(JSON.stringify(object))
    },
    isEqual: (object_1, object_2) => {
        if (JSON.stringify(object_1) != JSON.stringify(object_2)) {
            return false
        }
        return true
    },
    findDuplicates: (array, key) => {
        const seen = new Set();
        const duplicates = [];

        for (const item of array) {
            if (seen.has(item[key])) {
            duplicates.push(item);
            } else {
            seen.add(item[key]);
            }
        }

        return duplicates;
    },
    unitQty: (LargeUnitQty, SmallUnitQty, product) => {

        if(SmallUnitQty > 0 && (!product.SmallUnit || product.ConversionRate <= 0)) {
            throw new Error(`Mã sản phẩm [${product.ProductCode}] không có đơn vị 2`);
        }

        if(SmallUnitQty > 0 && SmallUnitQty > product.ConversionRate) {
            LargeUnitQty += Math.floor(SmallUnitQty / product.ConversionRate)
            SmallUnitQty = SmallUnitQty % product.ConversionRate
        }

        return  { LargeUnitQty: LargeUnitQty, SmallUnitQty: SmallUnitQty }
    },
    unitQtyTransfer: (LargeUnitQty, SmallUnitQty, product) => {
        
        if(SmallUnitQty > 0 && (!product.SmallUnit || product.ConversionRate <= 0)) {
            throw new Error(`Mã sản phẩm [${product.ProductCode}] không có đơn vị 2`);
        }

        let TransferUnitQty = SmallUnitQty
        if(product.ConversionRate > 0) {
            TransferUnitQty = SmallUnitQty + (LargeUnitQty * product.ConversionRate)
        } else {
            TransferUnitQty = LargeUnitQty
        }

        return TransferUnitQty
    },
    unitQtyLS: (Qty, product) => {
        let LargeUnitQty = 0
        let SmallUnitQty = 0
        if(product.ConversionRate > 0) {
            LargeUnitQty = Math.floor(Qty / product.ConversionRate)
            SmallUnitQty = Qty % product.ConversionRate
        } else {
            LargeUnitQty = Qty
        }

        return { LargeUnitQty: LargeUnitQty, SmallUnitQty: SmallUnitQty }
    },
    excelDate: (value) => {
        if(!(Number.isInteger(value) && value >= 0)) {
            throw new Error(`Ngày [${value}] bị sai format.`);
        }
        const date = moment('1899-12-30').add(value, 'days');

        return date.format('YYYY-MM-DD');
    }
}

const helpers = {
    install(app) {
        for (const [key, value] of Object.entries(functions)) {
            app.config.globalProperties[key] = value
        }
    },
}

export const helper = functions
export default helpers
