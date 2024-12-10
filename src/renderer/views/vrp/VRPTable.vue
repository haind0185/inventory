<template>
    <Modal :show="show" :title="'Bảng kết quả phân phối xe'" maxWidth="max-w-6xl" @close="onClose()" class="">
        <div class="gap-1 p-2 wrapper-scroll" style="height: 40rem;">
            <div class="parent-scroll">
                Danh sách tuyến
                <table class="view-scroll t-border">
                    <thead>
                        <tr>
                            <th>Xe</th>
                            <th>Doanh số xe</th>
                            <th>Doanh số đã giao</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>12</td>
                        </tr>
                    </tbody>
                </table>
            </div>
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