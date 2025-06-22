import { defineStore } from 'pinia'
import { initPinia } from '@/store/setup'
import api from '@/api'
import { store } from '.'

const initSearchCustomer = {
    CustomerCodes: null,
    OrderDateFrom: null,
    OrderDateTo: null,
    sort: null,
    sort_by: null,
    page: 1
}

const initSearchSaleStaff = {
    Ids: null,
    OrderDateFrom: null,
    OrderDateTo: null,
    sort: null,
    sort_by: null,
    page: 1
}

const createStore = defineStore('saleOffReport', {
    state: () => {
        return {
            searchCustomer: {
                ...initSearchCustomer
            },
            searchSaleStaff: {
                ...initSearchSaleStaff
            },
        }
    },
    getters: {
        
    },
    actions: {
        async customer(params) {
            store.setLoading(true)
            return await api.get(`/sale-off/report/customer`, { params: params })
                .then((res) => {
                    store.setLoading(false)
                    return res.data
                })
                .catch((error) => {
                    store.setLoading(false)
                    return false
                })
        },
        async saleStaff(params) {
            store.setLoading(true)
            return await api.get(`/sale-off/report/sale-staff`, { params: params })
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
        setSearchCustomer() {
            this.searchCustomer.sort = null
            this.searchCustomer.sort_by = 'asc'
            this.searchCustomer.page = 1
        },
        resetSearchCustomer() {
            this.searchCustomer = {...this.searchCustomer, ...initSearchCustomer}
        },
        setSearchSaleStaff() {
            this.searchSaleStaff.sort = null
            this.searchSaleStaff.sort_by = 'asc'
            this.searchSaleStaff.page = 1
        },
        resetSearchSaleStaff() {
            this.searchSaleStaff = {...this.searchSaleStaff, ...initSearchSaleStaff}
        },
    },
})

export const SOReport = createStore(initPinia)