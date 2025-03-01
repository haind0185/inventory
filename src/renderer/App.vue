<template>
    <router-view>
    </router-view>

    <Loading v-if="loading"></Loading>
    <Confirm ref="confirm"></Confirm>
    <Progress v-if="progress.value"></Progress>
</template>
<script setup>
import { watch, ref, computed } from 'vue'
import { store } from '@/store'
import Loading from '@/views/component/Loading.vue'
import Progress from '@/views/component/Progress.vue'

const errorModal = computed(() => store.errorModal)
const loading    = computed(() => store.loading)
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
</script>