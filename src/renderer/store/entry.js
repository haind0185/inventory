import { defineStore } from 'pinia'
import { initPinia } from '@/store/setup'
import api from '@/api'
import { store } from '.'

const searchInit = {
    EntryCode: null,
    EntryDate: null,
    sort: null,
    sort_by: null,
    page: 1
}
const productSearchInit = {
    ProductCode: null,
    EntryCode: null,
    EntryDateFrom: null,
    EntryDateTo: null,
    sort: null,
    sort_by: null,
    page: 1
}
const dateSearchInit = {
    ProductCode: null,
    EntryCode: null,
    EntryDateFrom: null,
    EntryDateTo: null,
    sort: null,
    sort_by: null,
    page: 1
}
const entryInit = {
    ProductCode: null,
    ExpiryDate: null,
    LargeUnitQty: 0,
    SmallUnitQty: 0,
    Price: 0,
    PriceQty: 0,
    Note: null,
}
const payloadInit = {
    EntryCode: null,
    EntryDate: null,
    EntryType: false,
}

const createStore = defineStore('entry', {
    state: () => {
        return {
            search: {
                ...searchInit
            },
            productSearch: {
                ...productSearchInit
            },
            dateSearch: {
                ...dateSearchInit
            },
            payload: {
                ...payloadInit
            },
            entries: [
                {...entryInit}
            ],
            products: []
        }
    },
    getters: {
        
    },
    actions: {
        async index(params) {
            store.setLoading(true)
            return await api.get(`/entries`, { params: params })
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
            return await api.get(`/entries/show`, { params: params })
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
            return await api.post(`/entries`, payload)
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
            return await api.post(`/entries/update`, payload)
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
            return await api.post(`/entries/delete`, payload)
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
            return await api.post(`/entries/import`, payload)
                .then((res) => {
                    store.setLoading(false)
                    return res.data
                })
                .catch((error) => {
                    store.setLoading(false)
                    return false
                })
        },

        async product(params) {
            store.setLoading(true)
            return await api.get(`/entries/product`, { params: params })
                .then((res) => {
                    store.setLoading(false)
                    return res.data
                })
                .catch((error) => {
                    store.setLoading(false)
                    return false
                })
        },

        async date(params) {
            store.setLoading(true)
            return await api.get(`/entries/date`, { params: params })
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
            this.search = {...this.search, ...searchInit}
        },
        setProductSearch() {
            this.productSearch.sort = null
            this.productSearch.sort_by = 'asc'
        },
        resetProductSearch() {
            this.productSearch = {...this.productSearch, ...productSearchInit}
        },
        setDateSearch() {
            this.dateSearch.sort = null
            this.dateSearch.sort_by = 'asc'
        },
        resetDateSearch() {
            this.dateSearch = {...this.dateSearch, ...dateSearchInit}
        },
        add() {
            this.entries.push({...entryInit})
        },
        delete(index) {
            this.entries = this.entries.filter((item, i) => i != index)
        },
        setEntry(entry) {
            this.entries.push(entry)
        },
        reset() {
            // this.entries = [{...entryInit}]
            this.entries = []
            this.payload = {...payloadInit}
        },
        setProducts(products) {
            this.products = products
        },
        getProduct(ProductCode) {
            return this.products.find(item => {
                return item.ProductCode == ProductCode
            })
        }
    },
})

export const entryStore = createStore(initPinia)
export const useEntryStore = () => {
    return entryStore
}
