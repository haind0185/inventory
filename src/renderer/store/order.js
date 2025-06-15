import { defineStore } from 'pinia'
import { initPinia } from '@/store/setup'
import api from '@/api'
import { store } from '.'
import { helper } from '@/helper'

const initSearch = {
    ExitCode: null,
    ExitDate: null,
    ExitDateFrom: null,
    ExitDateTo: null,
    sort: null,
    sort_by: null,
    page: 1
}

const payloadInit = {
    OrderCode    : null,
    OrderDate    : null,
    OrderNote    : null,
    SaleOffRoutes: []
}

const productInit = {
    ProductCode: null,
    LargeUnitQty: 0,
    SmallUnitQty: 0,
    Price: 0,
    PriceQty: 0,
    Note: null,
}
const customerInit = {
    CustomerCode: null,
    Products: [ helper.deepClone(productInit) ],
}
const saleStaffInit = {
    id: null,
    Customers: [ helper.deepClone(customerInit) ]
}
const deliveryStaffInit = {
    id: null
}
const saleRouteInit = {
    DeliveryStaffs: [ helper.deepClone(deliveryStaffInit) ],
    SaleStaffs: [ helper.deepClone(saleStaffInit) ],
    Background: helper.getBG()
}

const createStore = defineStore('order', {
    state: () => {
        return {
            search: {
                ...initSearch
            },
            payload: {
                ...payloadInit
            },
            saleRoutes: [
                helper.deepClone(saleRouteInit),
            ]
        }
    },
    getters: {
        
    },
    actions: {
        async index(params) {
            store.setLoading(true)
            return await api.get(`/sale-off/order`, { params: params })
                .then((res) => {
                    store.setLoading(false)
                    return res.data
                })
                .catch((error) => {
                    store.setLoading(false)
                    return false
                })
        },
        async store(payload) {
            store.setLoading(true)
            return await api.post(`/sale-off/order`, payload)
                .then((res) => {
                    store.setLoading(false)
                    return res.data
                })
                .catch((error) => {
                    store.setLoading(false)
                    return false
                })
        },

        // mutation
        setSearch() {
            this.search.sort = null
            this.search.sort_by = 'asc'
        },
        resetSearch() {
            this.search = {...this.search, ...initSearch}
        },
        reset() {
            this.saleRoutes =[]
        },
        routeAdd() {
            let saleRoute = helper.deepClone(saleRouteInit)
            saleRoute.Background = helper.getBG()
            this.saleRoutes.push(saleRoute)
        },
        routeRemove(index) {
            this.saleRoutes = this.saleRoutes.filter((item, i) => i != index)
        },
        deliveryStaffAdd(saleRoute) {
            saleRoute.DeliveryStaffs.push(helper.deepClone(deliveryStaffInit))
        },
        deliveryStaffRemove(saleRoute, index) {
            saleRoute.DeliveryStaffs = saleRoute.DeliveryStaffs.filter((item, i) => i != index)
        },
        saleStaffAdd(saleRoute) {
            saleRoute.SaleStaffs.push(helper.deepClone(saleStaffInit))
        },
        saleStaffRemove(saleRoute, index) {
            saleRoute.SaleStaffs = saleRoute.SaleStaffs.filter((item, i) => i != index)
        },
        customerAdd(saleStaff, CustomerCode=null) {
            let customer = helper.deepClone(customerInit)
            if(CustomerCode) {
                customer.CustomerCode = CustomerCode
            }
            saleStaff.Customers.push(customer)
        },
        customerRemove(saleStaff, index) {
            saleStaff.Customers = saleStaff.Customers.filter((item, i) => i != index)
        },
        customerClear(saleStaff) {
            saleStaff.Customers = []
        },
        productAdd(customer) {
            customer.Products.push(helper.deepClone(productInit))
        },
        productRemove(customer, index) {
            customer.Products = customer.Products.filter((item, i) => i != index)
        },
        getProduct(ProductCode) {
            return this.stocks.find(item => {
                return item.ProductCode == ProductCode
            })?.product
        }
    },
})

export const orderStore = createStore(initPinia)
export const useOrderStore = () => {
    return orderStore
}
