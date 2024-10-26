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
    Expire: 0,
    Price: 0,
    LargeUnit: UNIT[0],
    SmallUnit: UNIT[1],
    ConversionRate: 1,
}

const createStore = defineStore('product', {
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
            return await api.get(`/products`, { params: params })
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
            return await api.post(`/products`, payload)
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
            return await api.put(`/products`, payload)
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
            return await api.post(`/products/import`, payload)
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
            return await api.post(`/products/bulkCreate`, payload)
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
            return await api.get(`/products/show`, { params: params })
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
            return await api.get(`/products/list`, { params: params })
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
        // getProduct(ProductCode) {
        //     return this.products.find(item => {
        //         return item.ProductCode == ProductCode
        //     })
        // }
    },
})

export const productStore = createStore(initPinia)
export const useProductStore = () => {
    return productStore
}
