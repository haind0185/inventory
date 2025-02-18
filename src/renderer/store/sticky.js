import { defineStore } from 'pinia'
import { initPinia } from '@/store/setup'
import api from '@/api'
import { store } from '.'
import { UNIT } from '@/constant';

const createStore = defineStore('sticky', {
    state: () => {
        return {
            notes: [],
            highestZIndex: 1,
        }
    },
    getters: {
        
    },
    actions: {
        async index(params) {
            store.setLoading(true)
            return await api.get(`/sticky-note`, { params: params })
                .then((res) => {
                    store.setLoading(false)
                    this.notes = res.data.data.map(note => {
                        return {
                            ...note,
                            width: note.width || 250,
                            height: note.height || 350,
                            zIndex: note.zIndex || 1
                        }
                    });
                    this.highestZIndex = Math.max(1, ...this.notes.map(n => n.zIndex || 1));
                    console.log(this.highestZIndex)

                    return res.data
                })
                .catch((error) => {
                    store.setLoading(false)
                    return false
                })
        },
        async store(payload) {
            store.setLoading(true)
            this.highestZIndex++;
            const newNote = {
                title: "Ghi chú",
                text: "",
                x: Math.floor(Math.random() * (60 - 50 + 1)) + 50,
                y: Math.floor(Math.random() * (100 - 50 + 1)) + 90,
                width: 250,
                height: 350,
                color: this.getRandomColor(),
                zIndex: this.highestZIndex,
            };
            return await api.post(`/sticky-note`, newNote)
                .then((res) => {
                    store.setLoading(false)
                    console.log(res.data)
                    this.notes.push({ ...newNote, id: res.data.id });
                    return res.data
                })
                .catch((error) => {
                    store.setLoading(false)
                    return false
                })
        },
        async update(payload) {
            store.setLoading(true)
            return await api.put(`/sticky-note`, payload)
                .then((res) => {
                    store.setLoading(false)
                    console.log(res.data)
                    const index = this.notes.findIndex(note => note.id === payload.id);
                    console.log(this.notes)
                    if (index !== -1) this.notes[index] = { ...res.data };
                    return res.data
                })
                .catch((error) => {
                    store.setLoading(false)
                    return false
                })
        },
        async destroy(payload) {
            store.setLoading(true)
            return await api.post(`/sticky-note/delete`, payload)
                .then((res) => {
                    store.setLoading(false)
                    console.log(res.data)
                    this.notes = this.notes.filter(note => note.id !== payload.id);
                    return res.data
                })
                .catch((error) => {
                    store.setLoading(false)
                    return false
                })
        },
        

        // mutation
        getRandomColor() {
            // const colors = ["#FFEB3B", "#FFC107", "#FF9800", "#FF5722", "#4CAF50", "#2196F3", "#9C27B0"];
            const colors = ["#FFF7D1"];
            return colors[Math.floor(Math.random() * colors.length)];
        },
        bringToFront(id) {
            this.highestZIndex++;
            const note = this.notes.value.find(n => n.id === id);
            if (note) note.zIndex = this.highestZIndex;
        }
    },
})

export const stickyStore = createStore(initPinia)
export const useStickyStore = () => {
    return stickyStore
}
