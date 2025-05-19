import { defineStore } from 'pinia'
import { initPinia } from '@/store/setup'
import api from '@/api'
import { store } from '.'

const initTotalSearch = {
    ProductCode: null,
    ProductName: null,
    sort: null,
    sort_by: null,
    page: 1
}

const createStore = defineStore('stock', {
    state: () => {
        return {
            totalSearch: {
                ...initTotalSearch
            },
            stocks: []
        }
    },
    getters: {
        
    },
    actions: {
        async total(params = {}) {
            store.setLoading(true)
            return await api.get(`/sale-off/stock/total`, { params: params })
                .then((res) => {
                    store.setLoading(false)
                    return res.data
                })
                .catch((error) => {
                    store.setLoading(false)
                    return false
                })
        },
        async totalPrice(params = {}) {
            store.setLoading(true)
            return await api.get(`/sale-off/stock/totalPrice`, { params: params })
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
        setTotalSearch() {
            this.totalSearch.sort = null
            this.totalSearch.sort_by = 'asc'
            this.totalSearch.page = 1
        },
        resetTotalSearch() {
            this.totalSearch = {...this.totalSearch, ...initTotalSearch}
        },
        
    },
})

export const stockStore = createStore(initPinia)
export const useStockStore = () => {
    return stockStore
}
