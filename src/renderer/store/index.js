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
            updateModel: {
                active: false,
                title: '',
                message: '',
                type: 0,
            },
            downloadModel: {
                active: false,
                title: '',
                message: '',
                type: 0,
            },
            isUpdateAvailable: false,
            isUpdateDownloading: false,
            master: {},
            numberModal: 90,
            pageSearch: {
                isOpen: false,
                text: '',
            },
            progress: {
                isShow: false,
                value: 0,
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
        initUpdateModel() {
            this.updateModel = {
                active: false,
                title: '',
                message: '',
                type: 0,
            }
        },
        initDownloadModel() {
            this.downloadModel = {
                active: false,
                title: '',
                message: '',
                type: 0,
            }
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
        },
        setProgress(value) {
            this.progress.isShow = true
            this.progress.value = value
        },
        stopProgress() {
            this.progress.isShow = false
            this.progress.value = 0
        },
        onUpdateAvailable() {
            this.isUpdateAvailable = true
            this.isUpdateDownloading = true
        },
        onUpdateDownloaded() {
            this.isUpdateDownloading = false
            this.setUpdateDownloaded()

        },
        setUpdateDownloaded() {
            if(this.isUpdateAvailable) {
                this.downloadModel.active = false
                this.downloadModel.title = 'Cập nhật hoàn tất'
                this.downloadModel.message = 'Đã tải xong bản cập nhật! Khởi động lại ứng dụng để áp dụng thay đổi?'
                this.downloadModel.active = true
            }
        },
        quitAndInstall() {
            this.isUpdateDownloading = false
            this.isUpdateAvailable = false
            window.electron.quitAndInstall()
        }
    },
})

export const store = createStore(initPinia)
export const useStore = () => {
    return store
}
