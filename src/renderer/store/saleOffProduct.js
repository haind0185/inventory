import { defineStore } from 'pinia'
import { initPinia } from '@/store/setup'
import api from '@/api'
import { store } from '.'
import { UNIT } from '@/constant';

const initSearch = {
    ProductCode: null,
    ProductName: null,
    sort: null,
    sort_by: null,
    page: 1
}

const productInit = {
    ProductCode: null,
    ProductName: null,
    Price: 0,
    LargeUnit: UNIT[0],
    SmallUnit: UNIT[1],
    ConversionRate: 1,
}

const createStore = defineStore('saleOffProduct', {
    state: () => {
        return {
            search: {
                ...initSearch
            },
            products: [
            ],
            init: {
                ...productInit
            }
        }
    },
    getters: {
        
    },
    actions: {
        async index(params) {
            store.setLoading(true)
            return await api.get(`/sale-off/products`, { params: params })
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
            return await api.post(`/sale-off/products`, payload)
                .then((res) => {
                    store.setLoading(false)
                    return res.data
                })
                .catch((error) => {
                    store.setLoading(false)
                    return false
                })
        },
        async show(params) {
            store.setLoading(true)
            return await api.get(`/sale-off/products/show`, { params: params })
                .then((res) => {
                    store.setLoading(false)
                    return res.data
                })
                .catch((error) => {
                    store.setLoading(false)
                    return false
                })
        },
        async update(payload) {
            store.setLoading(true)
            return await api.put(`/sale-off/products`, payload)
                .then((res) => {
                    store.setLoading(false)
                    return res.data
                })
                .catch((error) => {
                    store.setLoading(false)
                    return false
                })
        },
        async destroy(payload) {
            store.setLoading(true)
            return await api.post(`/sale-off/products/delete`, payload)
                .then((res) => {
                    store.setLoading(false)
                    return res.data
                })
                .catch((error) => {
                    store.setLoading(false)
                    return false
                })
        },
        async import(payload) {
            store.setLoading(true)
            return await api.post(`/sale-off/products/import`, payload)
                .then((res) => {
                    store.setLoading(false)
                    return res.data
                })
                .catch((error) => {
                    store.setLoading(false)
                    return false
                })
        },
        async bulkCreate(payload) {
            store.setLoading(true)
            return await api.post(`/sale-off/products/bulkCreate`, payload)
                .then((res) => {
                    store.setLoading(false)
                    return res.data
                })
                .catch((error) => {
                    store.setLoading(false)
                    return false
                })
        },
        
        async list(params) {
            store.setLoading(true)
            return await api.get(`/sale-off/products/list`, { params: params })
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
        add() {
            this.products.push({...productInit})
        },
        delete(index) {
            this.products = this.products.filter((item, i) => i != index)
        },
        reset() {
            this.products = []
        },
        setProduct(product) {
            this.products.push(product)
        },
    },
})

export const saleOffProductStore = createStore(initPinia)
