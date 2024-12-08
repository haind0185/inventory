import { defineStore } from 'pinia'
import { initPinia } from '@/store/setup'
import api from '@/api'
import { store } from '.'
import { UNIT } from '@/constant';

const initSearch = {
    AgentCode: null,
    AgentName: null,
    AgentAddress: null,
    sort: null,
    sort_by: null,
    page: 1
}

const agentInit = {
    AgentCode: null,
    AgentName: null,
    AgentAddress: null,
    AgentLocationX: null,
    AgentLocationY: null,
}

const createStore = defineStore('agent', {
    state: () => {
        return {
            search: {
                ...initSearch
            },
            agents: [
            ],
            init: {
                ...agentInit
            }
        }
    },
    getters: {
        
    },
    actions: {
        async index(params) {
            store.setLoading(true)
            return await api.get(`/agents`, { params: params })
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
            return await api.post(`/agents`, payload)
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
            return await api.put(`/agents`, payload)
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
            return await api.post(`/agents/import`, payload)
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
            return await api.post(`/agents/bulkCreate`, payload)
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
            return await api.get(`/agents/show`, { params: params })
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
            return await api.get(`/agents/list`, { params: params })
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
            return await api.post(`/agents/delete`, payload)
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
        add() {
            this.agents.push({...agentInit})
        },
        delete(index) {
            this.agents = this.agents.filter((item, i) => i != index)
        },
        reset() {
            this.agents = []
        },
        setAgent(agent) {
            this.agents.push(agent)
        },
    },
})

export const agentStore = createStore(initPinia)
export const useAgentStore = () => {
    return agentStore
}
