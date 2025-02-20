import { defineStore } from 'pinia'
import { initPinia } from '@/store/setup'
import { t } from '@/i18n'

const createStore = defineStore('app', {
    state: () => {
        return {
            loading: false,
            errorModal: {
                active: false,
                title: '',
                message: '',
                type: 3,
            },
            master: {},
            numberModal: 90,
            pageSearch: {
                isOpen: false,
                text: '',
            }
        }
    },
    getters: {
        getUser: (state) => {
            return !state.user.data || Object.keys(state.user.data).length === 0 ? null : JSON.parse(state.user.data)
        },
    },
    actions: {
        // api
        

        // mutation
        setLoading(value) {
            this.loading = value
        },
        initErrorModal() {
            this.errorModal = {
                active: false,
                title: '',
                message: '',
                type: 3,
            }
        },
        showErrorModal(value) {
            this.errorModal.title = t("title.error")
            this.errorModal.message = value
            this.errorModal.active = true
        },
        addIndex() {
            this.numberModal += 1
        },
        subIndex() {
            this.numberModal -= 1
        },
        openPageSearch() {
            this.pageSearch.isOpen = true
        },
        closePageSearch() {
            this.pageSearch.isOpen = false
        },
        switchPareSearch() {
            if(this.pageSearch.isOpen) {
                this.closePageSearch()
            } else {
                this.openPageSearch()
            }
        }
    },
})

export const store = createStore(initPinia)
export const useStore = () => {
    return store
}
