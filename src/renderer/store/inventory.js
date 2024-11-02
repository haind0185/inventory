import { defineStore } from 'pinia'
import { initPinia } from '@/store/setup'
import api from '@/api'
import { store } from '.'

const initSearch = {
    ProductCode: null,
    ProductName: null,
    sort: null,
    sort_by: null,
    page: 1
}

const initTotalSearch = {
    ProductCode: null,
    ProductName: null,
    sort: null,
    sort_by: null,
    page: 1
}

const initProductSearch = {
    ProductCode: null,
    TypeDateFrom: null,
    TypeDateTo: null,
    sort: null,
    sort_by: null,
    page: 1
}

const createStore = defineStore('inventory', {
    state: () => {
        return {
            search: {
                ...initSearch
            },
            totalSearch: {
                ...initTotalSearch
            },
            productSearch: {
                ...initProductSearch
            },
            inventories: []
        }
    },
    getters: {
        
    },
    actions: {
        async index(params) {
            store.setLoading(true)
            return await api.get(`/inventory`, { params: params })
                .then((res) => {
                    store.setLoading(false)
                    return res.data
                })
                .catch((error) => {
                    store.setLoading(false)
                    return false
                })
        },
        async list(params = {}) {
            store.setLoading(true)
            return await api.get(`/inventory/list`, { params: params })
                .then((res) => {
                    store.setLoading(false)
                    return res.data
                })
                .catch((error) => {
                    store.setLoading(false)
                    return false
                })
        },
        async total(params = {}) {
            store.setLoading(true)
            return await api.get(`/inventory/total`, { params: params })
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
            return await api.get(`/inventory/totalPrice`, { params: params })
                .then((res) => {
                    store.setLoading(false)
                    return res.data
                })
                .catch((error) => {
                    store.setLoading(false)
                    return false
                })
        },
        async product(params = {}) {
            store.setLoading(true)
            return await api.get(`/inventory/product`, { params: params })
                .then((res) => {
                    store.setLoading(false)
                    return res.data
                })
                .catch((error) => {
                    store.setLoading(false)
                    return false
                })
        },

        async database() {
            // store.setLoading(true)
            return await api.get(`/inventory/download-database`)
                .then((res) => {
                    // store.setLoading(false)
                    return res.data
                })
                .catch((error) => {
                    // store.setLoading(false)
                    return false
                })
        },

        async stockReport() {
            // store.setLoading(true)
            return await api.get(`/inventory/export-report`)
                .then((res) => {
                    // store.setLoading(false)
                    return res.data
                })
                .catch((error) => {
                    // store.setLoading(false)
                    return false
                })
        },

        async exportStocktaking(payload) {
            // store.setLoading(true)
            return await api.post(`/inventory/export-stocktaking`, payload)
                .then((res) => {
                    // store.setLoading(false)
                    return res.data
                })
                .catch((error) => {
                    // store.setLoading(false)
                    return false
                })
        },

        async stocktaking(payload) {
            store.setLoading(true)
            return await api.post(`/inventory/stocktaking`, payload)
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
        setSearch(attr = {}) {
            this.search.sort = null
            this.search.sort_by = 'asc'
            this.search.page = 1
        },
        resetSearch() {
            this.search = {...this.search, ...initSearch}
        },
        setTotalSearch() {
            this.totalSearch.sort = null
            this.totalSearch.sort_by = 'asc'
            this.totalSearch.page = 1
        },
        resetTotalSearch() {
            this.totalSearch = {...this.totalSearch, ...initTotalSearch}
        },
        setProductSearch() {
            this.productSearch.sort = null
            this.productSearch.sort_by = 'asc'
            this.productSearch.page = 1
        },
        resetProductSearch() {
            this.productSearch = {...this.productSearch, ...initProductSearch}
        },
        setAttrProductSearch(attr = {}) {
            this.search =  {...this.search, ...attr}
        },
    },
})

export const inventoryStore = createStore(initPinia)
export const useInventoryStore = () => {
    return inventoryStore
}
