import { defineStore } from 'pinia'
import { initPinia } from '@/store/setup'
import api from '@/api'
import { store } from '.'

const initSearch = {
    ExitCode: null,
    ExitDate: null,
    EntryDateFrom: null,
    EntryDateTo: null,
    sort: null,
    sort_by: null,
    page: 1
}
const exitInit = {
    ProductCode: null,
    LargeUnitQty: 0,
    SmallUnitQty: 0,
    Price: 0,
    PriceQty: 0,
}
const payloadInit = {
    ExitCode: null,
    ExitDate: null,
    ExitType: false,
}

const createStore = defineStore('exit', {
    state: () => {
        return {
            search: {
                ...initSearch
            },
            payload: {
                ...payloadInit
            },
            exits: [
                {...exitInit}
            ],
            inventories: []
        }
    },
    getters: {
        
    },
    actions: {
        async index(params) {
            store.setLoading(true)
            return await api.get(`/exits`, { params: params })
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
            return await api.post(`/exits`, payload)
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
            return await api.post(`/exits/import`, payload)
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
            this.exits.push({...exitInit})
        },
        delete(index) {
            this.exits = this.exits.filter((item, i) => i != index)
        },
        setExit(exit) {
            this.exits.push(exit)
        },
        reset() {
            this.exits = []
            // this.exits = [{...exitInit}]
            this.payload = {...payloadInit}
        },
        setInventories(data) {
            this.inventories = data
        },
        getProduct(ProductCode) {
            return this.inventories.find(item => {
                return item.ProductCode == ProductCode
            })?.product
        }
    },
})

export const exitStore = createStore(initPinia)
export const useExitStore = () => {
    return exitStore
}
