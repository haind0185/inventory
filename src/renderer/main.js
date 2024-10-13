/**
 * Vue setup
 */
import { createApp } from 'vue'
import VueCookies from 'vue-cookies'
import 'vue-select/dist/vue-select.css'

import i18n from "@/i18n"
import helpers from '@/helper'
import App from './App.vue'
import router from './router'
import { initPinia } from '@/store/setup'
import './style.css'

import Modal from '@/views/component/layout/Modal.vue'
import Confirm from '@/views/component/Confirm.vue'
import Sort from '@/views/component/Sort.vue'
import vSelect from 'vue-select'



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
    .component('select2', vSelect)

app.mount('#app')
