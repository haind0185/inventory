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

const createStore = defineStore('saleOffReport', {
    state: () => {
        return {
            searchCustomer: {
                ...initSearchCustomer
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

        // mutation
        setSearchCustomer() {
            this.searchCustomer.sort = null
            this.searchCustomer.sort_by = 'asc'
            this.searchCustomer.page = 1
        },
        resetSearchCustomer() {
            this.searchCustomer = {...this.searchCustomer, ...initSearchCustomer}
        },
    },
})

export const SOReport = createStore(initPinia)