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
    console.log("Bắt đầu đồng bộ trước khi thoát...")
    try {
        await stickyStore.syncData()
        console.log("Đồng bộ xong, gửi sự kiện sync-done")
        window.electron.syncDone() // Gửi lại sự kiện để Main Process thoát ứng dụng
    } catch (error) {
        console.error("Lỗi đồng bộ:", error)
    }
});

window.electron.onFind(async () => {
    store.openPageSearch()
});
