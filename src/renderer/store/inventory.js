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

const createStore = defineStore('inventory', {
    state: () => {
        return {
            search: {
                ...initSearch
            },
            totalSearch: {
                ...initTotalSearch
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

        // mutation
        setSearch() {
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
    },
})

export const inventoryStore = createStore(initPinia)
export const useInventoryStore = () => {
    return inventoryStore
}
