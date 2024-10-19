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
const entryInit = {
    ProductCode: null,
    LargeUnitQty: 0,
    SmallUnitQty: 0,
    ExpiryDate: null,
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

        // mutation
        setSearch() {
            this.search.sort = null
            this.search.sort_by = 'asc'
        },
        resetSearch() {
            this.search = {...this.search, ...searchInit}
        },
        add() {
            this.entries.push({...entryInit})
        },
        delete(index) {
            this.entries = this.entries.filter((item, i) => i != index)
        },
        reset() {
            this.entries = [{...entryInit}]
            this.payload = {}
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
