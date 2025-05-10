<template>
    <Modal :show="show" :title="title" maxWidth="max-w-[20rem]" @close="onClose()" class="">
        <form class="flex flex-col justify-between h-full gap-1 p-2" @submit.prevent="onSave()">
            <div class="flex-col gap-1 d-flex">
                <!-- SaleStaffName -->
                <fieldset class="w-[100%] form-input required">
                    <legend>Tên nhân viên</legend>
                    <input type="text" class="w-full form-control" required v-model="payload.SaleStaffName">
                </fieldset>
            </div>

            <div class="flex justify-around w-full mt-[2rem]">
                <button type="button" class="btn silver w-[6rem]" @click="onClose()">{{ $t("button.cancel") }}</button>
                <button type="submit" class="btn w-[6rem]">{{ $t("button.save") }}</button>
            </div>
        </form>
    </Modal>
    <Confirm ref="confirm"></Confirm>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue'
import { t } from '@/i18n'
import { saleStaffStore } from '@/store/saleStaff';

const props = defineProps(['show'])
const emit = defineEmits(['close', 'save'])
const title = "Thêm NV bán hàng"

const payload = ref({
    SaleStaffName: null,
})
const confirm = ref(null)
const reload = ref(false)

const onClose = () => {
    emit('close', reload.value)
}

const onSave = async () => {
    const res = await saleStaffStore.store(payload.value).then((res) => {
        if (res && res.code == 200) {
            reload.value = true
            return true
        }
        return false
    })
    if (res) {
        await confirm.value.show({
            title: t("title.notify"),
            message: t("msg.save_ok"),
            cancelButton: t("button.back"),
            type: 1
        })
        emit('save', reload.value)
    }

}
</script>