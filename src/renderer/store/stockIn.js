import { defineStore } from 'pinia'
import { initPinia } from '@/store/setup'
import api from '@/api'
import { store } from '.'
import { saleOffProductStore } from './saleOffProduct'

const initSearch = {
    StockInCode: null,
    StockInDate: null,
    StockInDateFrom: null,
    StockInDateTo: null,
    sort: null,
    sort_by: null,
    page: 1
}

const payloadInit = {
    StockInCode: null,
    StockInDate: null,
    StockInNote: null,
}

const itemInit = {
    ProductCode: null,
    LargeUnitQty: 0,
    SmallUnitQty: 0,
    Price: 0,
    PriceQty: 0,
    StockInItemNote: null,
}

const createStore = defineStore('stockIn', {
    state: () => {
        return {
            search: {
                ...initSearch
            },
            payload: {
                ...payloadInit
            },
            items: [
                {...itemInit}
            ],
        }
    },
    getters: {
        
    },
    actions: {
        async index(params) {
            store.setLoading(true)
            return await api.get(`/sale-off/stock-ins`, { params: params })
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
            return await api.post(`/sale-off/stock-ins`, payload)
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
            return await api.post(`/sale-off/stock-ins/import`, payload)
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
            return await api.get(`/sale-off/stock-ins/show`, { params: params })
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
            return await api.post(`/sale-off/stock-ins/update`, payload)
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
        getProduct(ProductCode) {
            if(!ProductCode) {
                return null
            }
            return saleOffProductStore.products.find(item => {
                return item.ProductCode == ProductCode
            })
        },
        add() {
            this.items.push({...itemInit})
        },
        delete(index) {
            this.items = this.items.filter((item, i) => i != index)
        },
        reset(rmPayload=true) {
            this.items = []
            if(rmPayload) {
                this.payload = {...payloadInit}
            }
        },
        setItem(item) {
            this.items.push(item)
        },
    },
})

export const stockInStore = createStore(initPinia)