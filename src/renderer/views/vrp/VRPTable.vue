<template>
    <Modal :show="show" :title="'Bảng kết quả phân phối xe'" maxWidth="max-w-6xl" @close="onClose()" class="">
        <div class="p-2">
            
        </div>
    </Modal>

    <Confirm ref="confirm"></Confirm>
</template>

<style>

</style>

<script setup>
import { onMounted, ref, watch } from 'vue'
import { t } from '@/i18n'

const { show, routes, unassigned, payload } = defineProps(['show', 'routes', 'unassigned', 'payload'])
console.log(routes)
console.log(unassigned)
console.log(payload)
const emit = defineEmits(['close', 'save'])
const onClose = () => {
    emit('close')
}
</script>