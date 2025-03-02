<template>
    <router-view>
    </router-view>

    <Loading v-if="loading"></Loading>
    <DownLoading v-if="isUpdateDownloading" :isVisible="isUpdateDownloading"></DownLoading>
    <Confirm ref="confirm"></Confirm>
    <Progress v-if="progress.value"></Progress>
</template>
<script setup>
import { watch, ref, computed } from 'vue'
import { store } from '@/store'
import Loading from '@/views/component/Loading.vue'
import DownLoading from '@/views/component/DownLoading.vue'
import Progress from '@/views/component/Progress.vue'

const errorModal = computed(() => store.errorModal)
const downloadModel = computed(() => store.downloadModel)
const loading    = computed(() => store.loading)
const isUpdateDownloading    = computed(() => store.isUpdateDownloading)
const confirm   = ref(null)
const progress = computed(() => store.progress)

watch(
    errorModal,
    async (errorModal) => {
        if (errorModal.active) {
            await confirm.value.show(errorModal)
            store.initErrorModal()
        }
    },
    { deep: true }
)

watch(
    downloadModel,
    async (downloadModel) => {
        if (downloadModel.active) {
            const ok = await confirm.value.show(downloadModel)
            if(ok) {
                store.initDownloadModel()
                confirm.value.close()
                store.quitAndInstall()
            }
        }
    },
    { deep: true }
)
</script>