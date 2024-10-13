import { defineStore } from 'pinia'
import { initPinia } from '@/store/setup'
import api from '@/api'
import { store } from '.'

const initSearch = {
    code: null,
    name: null,
    sort: null,
    sort_by: null,
}

const createStore = defineStore('product', {
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
            return await api.post(`/products`, payload)
                .then((res) => {
                    return res.data
                })
                .catch((error) => {
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

export const productStore = createStore(initPinia)
export const useProductStore = () => {
    return productStore
}
