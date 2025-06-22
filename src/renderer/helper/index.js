import moment from 'moment'

let lastHue = null;

const functions = {
    format_number: (value, decimals, currency) => {
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
        return {
            hours: date.getHours(),
            minutes: date.getMinutes(),
            seconds: date.getSeconds(),
        }
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
            if (
                typeof object[key] === 'object' &&
                typeof object[key]?.['getFullYear'] === 'function'
            ) {
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
            if (
                typeof object[key] === 'string' &&
                object[key].substr(0, 11).match(/\d{4}-\d{2}-\d{2}T/)
            ) {
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
        const seen = new Set()
        const duplicates = []

        for (const item of array) {
            if (seen.has(item[key])) {
                duplicates.push(item)
            } else {
                seen.add(item[key])
            }
        }

        return duplicates
    },
    unitQty: (LargeUnitQty, SmallUnitQty, product) => {
        if (SmallUnitQty > 0 && (!product.SmallUnit || product.ConversionRate <= 0)) {
            throw new Error(`Mã sản phẩm [${product.ProductCode}] không có đơn vị 2`)
        }

        if (SmallUnitQty > 0 && SmallUnitQty > product.ConversionRate) {
            LargeUnitQty += Math.floor(SmallUnitQty / product.ConversionRate)
            SmallUnitQty = SmallUnitQty % product.ConversionRate
        }

        return { LargeUnitQty: LargeUnitQty, SmallUnitQty: SmallUnitQty }
    },
    unitQtyTransfer: (LargeUnitQty, SmallUnitQty, product) => {
        if (SmallUnitQty > 0 && (!product.SmallUnit || product.ConversionRate <= 0)) {
            throw new Error(`Mã sản phẩm [${product.ProductCode}] không có đơn vị 2`)
        }

        let TransferUnitQty = SmallUnitQty
        if (product.ConversionRate > 0) {
            TransferUnitQty = SmallUnitQty + LargeUnitQty * product.ConversionRate
        } else {
            TransferUnitQty = LargeUnitQty
        }

        return TransferUnitQty
    },
    unitQtyLS: (Qty, product) => {
        let LargeUnitQty = 0
        let SmallUnitQty = 0
        if (product.ConversionRate > 0) {
            LargeUnitQty = Math.floor(Qty / product.ConversionRate)
            SmallUnitQty = Qty % product.ConversionRate
        } else {
            LargeUnitQty = Qty
        }

        return { LargeUnitQty: LargeUnitQty, SmallUnitQty: SmallUnitQty }
    },
    excelDate: (value) => {
        if (!(Number.isInteger(value) && value >= 0)) {
            throw new Error(`Ngày [${value}] bị sai format.`)
        }
        const date = moment('1899-12-30').add(value, 'days')

        return date.format('YYYY-MM-DD')
    },
    parseBoolean: (value) => {
        if (value === null || value === undefined || value === '') return undefined

        const val = value.toString().toLowerCase().trim()
        if (val === 'true' || val === '1') return true
        if (val === 'false' || val === '0') return false

        return undefined
    },
    getBG: () => {
        let hue
        do {
            hue = Math.floor(Math.random() * 360)
        } while (lastHue !== null && Math.abs(hue - lastHue) < 40)
        lastHue = hue
        const saturation = 60 + Math.random() * 30 // 60-90%
        const lightness = 60 + Math.random() * 20 // 60-80%
        return `hsl(${hue}, ${saturation}%, ${lightness}%)`
    },
    getOrderCode: (no) => {
        return `X${moment().format('YYYYMMDD')}${no.toString().padStart(2, 0)}`
    },
    getStockInCode: (no) => {
        return `N${moment().format('YYYYMMDD')}${no.toString().padStart(2, 0)}`
    },
    unFlattenSequelizeObject: (flatObj) => {
        const result = {}

        for (const [flatKey, value] of Object.entries(flatObj)) {
            const keys = flatKey.split('.')
            let current = result

            for (let i = 0; i < keys.length; i++) {
                const key = keys[i]

                if (i === keys.length - 1) {
                    current[key] = value
                } else {
                    if (!current[key]) {
                        current[key] = {}
                    }
                    current = current[key]
                }
            }
        }

        return result
    },
    transformDataCustomer: (items) => {
        const result = []

        for (const item of items) {
            const customerCode = item.CustomerCode
            const customerName = item.CustomerName
            const orderItem = item.saleOffOrderItems

            // Bỏ qua item nếu không có đơn hàng thực tế
            if (
                !orderItem ||
                !orderItem.saleOffRoute ||
                !orderItem.saleOffRoute.saleOffOrder?.OrderCode
            )
                continue

            const order = orderItem.saleOffRoute.saleOffOrder
            const month = moment(order.OrderDate).format('YYYY-MM')

            const product = {
                ProductCode: orderItem.ProductCode,
                OrderItemNote: orderItem.OrderItemNote,
                ProductNameLabel: `[${orderItem.saleOffProduct.ProductCode}] ${orderItem.saleOffProduct.ProductName}`,
                Price: orderItem.saleOffProduct.Price,
                LargeUnitQty: orderItem.LargeUnitQty,
                SmallUnitQty: orderItem.SmallUnitQty,
                Qty: helper.unitQtyTransfer(
                    orderItem.LargeUnitQty,
                    orderItem.SmallUnitQty,
                    orderItem.saleOffProduct
                ),
                PriceQty:
                    orderItem.saleOffProduct.Price *
                    helper.unitQtyTransfer(
                        orderItem.LargeUnitQty,
                        orderItem.SmallUnitQty,
                        orderItem.saleOffProduct
                    ),
            }

            // === Group theo Customer ===
            let customer = result.find((c) => c.CustomerCode === customerCode)
            if (!customer) {
                customer = {
                    CustomerCode: customerCode,
                    CustomerName: customerName,
                    Months: [],
                }
                result.push(customer)
            }

            // === Group theo Month ===
            let monthGroup = customer.Months.find((m) => m.Name === month)
            if (!monthGroup) {
                monthGroup = {
                    Name: month,
                    Orders: [],
                }
                customer.Months.push(monthGroup)
            }

            // === Group theo OrderCode ===
            let orderGroup = monthGroup.Orders.find((o) => o.OrderCode === order.OrderCode)
            if (!orderGroup) {
                orderGroup = {
                    OrderCode: order.OrderCode,
                    OrderDate: order.OrderDate,
                    Products: [],
                }
                monthGroup.Orders.push(orderGroup)
            }

            // === Push Product ===
            orderGroup.Products.push(product)
        }

        return result
    },

    transformDataSaleStaff: (items) => {
        const result = []

        for (const item of items) {
            const saleStaffId = item.id
            const saleStaffName = item.SaleStaffName
            const orderItem = item.saleOffOrderItems

            // Bỏ qua item nếu không có đơn hàng thực tế
            if (
                !orderItem ||
                !orderItem.saleOffRoute ||
                !orderItem.saleOffRoute.saleOffOrder?.OrderCode
            )
                continue

            const order = orderItem.saleOffRoute.saleOffOrder
            const month = moment(order.OrderDate).format('YYYY-MM')

            const product = {
                ProductCode: orderItem.ProductCode,
                OrderItemNote: orderItem.OrderItemNote,
                ProductNameLabel: `[${orderItem.saleOffProduct.ProductCode}] ${orderItem.saleOffProduct.ProductName}`,
                Price: orderItem.saleOffProduct.Price,
                LargeUnitQty: orderItem.LargeUnitQty,
                SmallUnitQty: orderItem.SmallUnitQty,
                Qty: helper.unitQtyTransfer(
                    orderItem.LargeUnitQty,
                    orderItem.SmallUnitQty,
                    orderItem.saleOffProduct
                ),
                PriceQty:
                    orderItem.saleOffProduct.Price *
                    helper.unitQtyTransfer(
                        orderItem.LargeUnitQty,
                        orderItem.SmallUnitQty,
                        orderItem.saleOffProduct
                    ),
            }

            // === Group theo SaleStaff ===
            let saleStaff = result.find((c) => c.id === saleStaffId)
            if (!saleStaff) {
                saleStaff = {
                    id: saleStaffId,
                    SaleStaffName: saleStaffName,
                    Months: [],
                }
                result.push(saleStaff)
            }

            // === Group theo Month ===
            let monthGroup = saleStaff.Months.find((m) => m.Name === month)
            if (!monthGroup) {
                monthGroup = {
                    Name: month,
                    Orders: [],
                }
                saleStaff.Months.push(monthGroup)
            }

            // === Group theo OrderCode ===
            let orderGroup = monthGroup.Orders.find((o) => o.OrderCode === order.OrderCode)
            if (!orderGroup) {
                orderGroup = {
                    OrderCode: order.OrderCode,
                    OrderDate: order.OrderDate,
                    Products: [],
                }
                monthGroup.Orders.push(orderGroup)
            }

            // === Push Product ===
            orderGroup.Products.push(product)
        }

        return result
    },

    transformDeliveryStaff: (items) => {
        // Map staffId -> staff data (gồm Months ...)
        const staffMap = new Map()

        items = items.filter(item =>
            (item.saleOffRoutes1 && item.saleOffRoutes1.id) ||
            (item.saleOffRoutes2 && item.saleOffRoutes2.id) ||
            (item.saleOffRoutes3 && item.saleOffRoutes3.id)
        );

        items.forEach((item) => {
            const staffId = item.id
            if (!staffMap.has(staffId)) {
                staffMap.set(staffId, {
                    id: staffId,
                    DeliveryStaffName: item.DeliveryStaffName,
                    MonthsMap: new Map(), // để gom orders theo tháng
                })
            }

            const staffData = staffMap.get(staffId)

            // Gom tất cả routes 1,2,3, filter id tồn tại
            const allRoutes = [
                item.saleOffRoutes1,
                item.saleOffRoutes2,
                item.saleOffRoutes3,
            ].filter((r) => r && r.id)

            allRoutes.forEach((route) => {
                if (!route.saleOffOrder || !route.saleOffOrder.OrderDate) return

                const monthKey = moment(route.saleOffOrder.OrderDate).format('YYYY-MM')
                if (!staffData.MonthsMap.has(monthKey)) {
                    staffData.MonthsMap.set(monthKey, {
                        Name: monthKey,
                        OrdersMap: new Map(), // gom orders theo OrderCode
                    })
                }

                const monthData = staffData.MonthsMap.get(monthKey)
                const orderCode = route.saleOffOrder.OrderCode

                if (!monthData.OrdersMap.has(orderCode)) {
                    monthData.OrdersMap.set(orderCode, {
                        OrderCode: orderCode,
                        OrderDate: route.saleOffOrder.OrderDate,
                        Workload: route.workLoad,
                        Products: [],
                    })
                }

                const orderData = monthData.OrdersMap.get(orderCode)

                // Thêm product vào order
                if (route.saleOffOrderItems && route.saleOffOrderItems.ProductCode) {
                    orderData.Products.push({
                        ProductCode: route.saleOffOrderItems.ProductCode,
                        OrderItemNote: route.saleOffOrderItems.OrderItemNote,
                        ProductNameLabel: `[${route.saleOffOrderItems.saleOffProduct.ProductCode}] ${route.saleOffOrderItems.saleOffProduct.ProductName}`,
                        Price: route.saleOffOrderItems.saleOffProduct.Price,
                        LargeUnitQty: route.saleOffOrderItems.LargeUnitQty,
                        SmallUnitQty: route.saleOffOrderItems.SmallUnitQty,
                        Qty: helper.unitQtyTransfer(
                            route.saleOffOrderItems.LargeUnitQty,
                            route.saleOffOrderItems.SmallUnitQty,
                            route.saleOffOrderItems.saleOffProduct
                        ),
                        PriceQty:
                            route.saleOffOrderItems.saleOffProduct.Price *
                            helper.unitQtyTransfer(
                                route.saleOffOrderItems.LargeUnitQty,
                                route.saleOffOrderItems.SmallUnitQty,
                                route.saleOffOrderItems.saleOffProduct
                            ),
                    })
                }
            })
        })

        // Chuyển đổi cấu trúc map -> array
        let result = []
        for (const staff of staffMap.values()) {
            const Months = []
            for (const monthData of staff.MonthsMap.values()) {
                const Orders = Array.from(monthData.OrdersMap.values())
                Months.push({ Name: monthData.Name, Orders })
            }
            // Sắp xếp tháng tăng dần nếu muốn
            Months.sort((a, b) => b.Name.localeCompare(a.Name))

            result.push({
                id: staff.id,
                DeliveryStaffName: staff.DeliveryStaffName,
                Months,
            })
        }

        result = result.map((re) => {
            let staffQty = re.Months.reduce((sum, item) => sum + item.Orders.reduce((sum, item) => sum + ((item.Products.reduce((sum, item) => sum + item.PriceQty, 0)) / item.Workload), 0), 0)
            re.StaffQty = staffQty
            re.SupportStaffQty = Math.floor(staffQty * 0.003 / 1000) * 1000

            re.Months = re.Months.map((month) => {
                let monthQty = month.Orders.reduce((sum, item) => sum + ((item.Products.reduce((sum, item) => sum + item.PriceQty, 0)) / item.Workload), 0)
                month.MonthQty = monthQty

                month.Orders = month.Orders.map((order) => {
                    let orderQty = order.Products.reduce((sum, item) => sum + item.PriceQty, 0)
                    order.orderQty = orderQty
                    return order
                })

                return month
            })
            return re
        })

        return result
    },

    sortCustomersByOrderDate: (data) => {
        return data.map((customer) => {
            // Sort Orders in each Month by OrderDate desc
            const sortedMonths = customer.Months.map((month) => {
                const sortedOrders = [...month.Orders].sort((a, b) => {
                    return new Date(b.OrderDate) - new Date(a.OrderDate)
                })

                return {
                    ...month,
                    Orders: sortedOrders,
                }
            }).sort((a, b) => {
                // Sort Months by YYYY-MM descending
                return b.Name.localeCompare(a.Name)
            })

            return {
                ...customer,
                Months: sortedMonths,
            }
        })
    },
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
