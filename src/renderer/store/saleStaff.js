import { defineStore } from 'pinia'
import { initPinia } from '@/store/setup'
import api from '@/api'
import { store } from '.'
import { UNIT } from '@/constant';

const initSearch = {
    SaleStaffName: null,
    SaleStaffActive: null,
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

const createStore = defineStore('saleStaff', {
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
            return await api.get(`/sale-off/sale-staffs`, { params: params })
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
            return await api.post(`/sale-off/sale-staffs`, payload)
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
            return await api.get(`/sale-off/sale-staffs/show`, { params: params })
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
            return await api.put(`/sale-off/sale-staffs`, payload)
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
            return await api.post(`/sale-off/sale-staffs/delete`, payload)
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
            return await api.get(`/sale-off/sale-staffs/list`, { params: params })
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
    },
})

export const saleStaffStore = createStore(initPinia)
