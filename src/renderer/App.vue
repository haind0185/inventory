<template>
    <router-view>
    </router-view>

    <Loading v-if="loading"></Loading>
    <Confirm ref="confirm"></Confirm>
</template>
<script setup>
import { watch, ref, computed } from 'vue'
import { store } from '@/store'
import Loading from '@/views/component/Loading.vue'

const errorModal = computed(() => store.errorModal)
const loading    = computed(() => store.loading)
const confirm   = ref(null)

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