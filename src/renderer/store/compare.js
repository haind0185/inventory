import { defineStore } from 'pinia'
import { initPinia } from '@/store/setup'
import api from '@/api'
import { store } from '.'

const createStore = defineStore('entry', {
    state: () => {
        return {
            
        }
    },
    getters: {
        
    },
    actions: {
        async import(payload) {
            store.setLoading(true)
            return await api.post(`/compares/import`, payload)
                .then((res) => {
                    store.setLoading(false)
                    return res.data
                })
                .catch((error) => {
                    store.setLoading(false)
                    return false
                })
        },
    },
})

export const compareStore = createStore(initPinia)
export const useCompareStore = () => {
    return compareStore
}
