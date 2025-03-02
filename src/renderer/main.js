/**
 * Vue setup
 */
import { createApp, onMounted } from 'vue'
import VueCookies from 'vue-cookies'
import 'vue-select/dist/vue-select.css'

import i18n from "@/i18n"
import helpers from '@/helper'
import App from './App.vue'
import router from './router'
import { initPinia } from '@/store/setup'
import { stickyStore } from '@/store/sticky'
import { store } from '@/store'
import './style.css'

import Modal from '@/views/component/layout/Modal.vue'
import Confirm from '@/views/component/Confirm.vue'
import Sort from '@/views/component/Sort.vue'
import Pagination from '@/views/component/Pagination.vue'
import Date from '@/views/component/Date.vue'
import vSelect from '@/views/component/Select2.vue'
// import vSelect from 'vue-select'

/**
 * Vue install
 */
const app = createApp(App)

// setup
app.use(VueCookies, { expire: '7d' })
    .use(router)
    .use(i18n)
    .use(helpers)
    .use(initPinia)

// add component
app.component('Modal', Modal)
    .component('Confirm', Confirm)
    .component('ThSort', Sort)
    .component('Pagination', Pagination)
    .component('Date', Date)
    .component('select2', vSelect)

app.mount('#app')

app.directive("select-on-focus", {
    mounted(el) {
        el.addEventListener("focus", () => el.select());
    },
});


stickyStore.startSync()


window.electron.onSyncBeforeQuit(async () => {
    try {
        await stickyStore.syncData()
        window.electron.syncDone() // Gửi lại sự kiện để Main Process thoát ứng dụng
    } catch (error) {
        console.error("Sync error:", error)
    }
});

window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault()
        store.switchPareSearch()
    }
})

window.electron.onUpdateAvailable(async () => {
    try {
        await store.onUpdateAvailable()
    } catch (error) {
        console.error(error)
    }
});

window.electron.onUpdateDownloaded(async () => {
    try {
        await store.onUpdateDownloaded()
    } catch (error) {
        console.error(error)
    }
});
