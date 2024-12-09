import { defineStore } from 'pinia'
import { initPinia } from '@/store/setup'
import api from '@/api'
import { store } from '.'

const initSearch = {
    AgentCode: null,
    AgentName: null,
    AgentAddress: null,
    sort: null,
    sort_by: null,
    page: 1
}

const vehicleInit = {
    VehicleCode: null,
    VehicleCapacity: null,
}

const agentInit = {
    AgentCode: null,
    AgentDelivery: null,
}

const createStore = defineStore('vrp', {
    state: () => {
        return {
            search: {
                ...initSearch
            },
            vehicles: [
            ],
            init: {
                ...vehicleInit
            },
            agents: [
            ],
            initAgent: {
                ...agentInit
            },
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
            return await api.post(`/vrp/import`, payload)
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
            this.vehicles.push({...vehicleInit})
        },
        delete(index) {
            this.vehicles = this.vehicles.filter((item, i) => i != index)
        },
        reset() {
            this.vehicles = []
        },
        setVehicle(vehicle) {
            this.vehicles.push(vehicle)
        },

        // agents
        addAgent() {
            this.agents.push({...agentInit})
        },
        deleteAgent(index) {
            this.agents = this.agents.filter((item, i) => i != index)
        },
        resetAgent() {
            this.agents = []
        },
        setAgent(agent) {
            this.agents.push(agent)
        },
    },
})

export const vrpStore = createStore(initPinia)
export const useVrpStore = () => {
    return vrpStore
}
