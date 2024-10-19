import { defineStore } from 'pinia'
import { initPinia } from '@/store/setup'
import api from '@/api'
import { store } from '.'

const initSearch = {
    ExitCode: null,
    ExitDate: null,
    sort: null,
    sort_by: null,
    page: 1
}

const createStore = defineStore('exit', {
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

export const exitStore = createStore(initPinia)
export const useExitStore = () => {
    return exitStore
}
