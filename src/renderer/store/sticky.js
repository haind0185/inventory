import { defineStore } from "pinia";
import { initPinia } from "@/store/setup";
import api from "@/api";
import { store } from ".";

// console.log(localStorage.getItem("stickyNotes") == 'undefined')
const createStore = defineStore("sticky", {
    state: () => {
        return {
            notes: localStorage.getItem("stickyNotes") == 'undefined' ? [] : JSON.parse(localStorage.getItem("stickyNotes")),
            syncInterval: null,
            syncTime: 10000,
        };
    },
    getters: {},
    actions: {
        async syncData() {
            try {
                const notes = localStorage.getItem("stickyNotes") == 'undefined' ? [] : JSON.parse(localStorage.getItem("stickyNotes"))

                const response = await api.post(`/sticky-note/sync`, { notes: notes });

                if (response.status === 200) {
                    this.notes = response.data.data;
                    localStorage.setItem("stickyNotes", JSON.stringify(this.notes));
                    console.log("Đồng bộ dữ liệu thành công!");
                }
            } catch (error) {
                console.error("Lỗi đồng bộ dữ liệu:", error);
            }
        },

        startSync() {
            if (this.syncInterval) return; // Tránh thiết lập nhiều lần

            this.syncInterval = setInterval(() => {
                this.syncData();
            }, this.syncTime);

            console.log("Bắt đầu đồng bộ dữ liệu mỗi 10s.");
        },

        stopSync() {
            if (this.syncInterval) {
                clearInterval(this.syncInterval);
                this.syncInterval = null;
                console.log("Dừng đồng bộ dữ liệu.");
            }
        },
    },
});

export const stickyStore = createStore(initPinia);
export const useStickyStore = () => {
    return stickyStore;
};
