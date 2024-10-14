import { defineStore } from 'pinia'
import { initPinia } from '@/store/setup'
import api from '@/api'
import { store } from '.'

const initSearch = {
    EntryCode: null,
    EntryDate: null,
    sort: null,
    sort_by: null,
    page: 1
}

const createStore = defineStore('entry', {
    state: () => {
        return {
            search: {
                ...initSearch
            },

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
            this.search = {...this.search, ...initSearch}
        },
    },
})

export const entryStore = createStore(initPinia)
export const useEntryStore = () => {
    return entryStore
}
