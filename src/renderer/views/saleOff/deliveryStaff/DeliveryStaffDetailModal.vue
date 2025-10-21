<template>
    <Modal :show="show" :title="title" maxWidth="max-w-[25rem]" @close="onClose()" class="">
        <form class="flex flex-col justify-between h-full gap-1 p-2" @submit.prevent="onSave()">
            <div class="flex-col gap-1 d-flex">
                <!-- DeliveryStaffName -->
                <fieldset class="w-[100%] form-input required">
                    <legend>Tên nhân viên</legend>
                    <input type="text" class="w-full form-control" required v-model="payload.DeliveryStaffName">
                </fieldset>
                
                <!-- DeliveryStaffActive -->
                <fieldset class="w-[100%] form-input required">
                    <legend>Tình trạng</legend>
                    <template v-if="ACTIVE_LIST">
                        <div class="flex gap-4">
                            <label class="flex items-center gap-1" v-for="[key, value] of Object.entries(ACTIVE_LIST)">
                                <input type="radio" class="" name="title-active-01" :value="key" v-model="payload.DeliveryStaffActive">{{ value }}
                            </label>
                        </div>
                    </template>
                </fieldset>
            </div>

            <div class="flex justify-around w-full mt-[10rem]">
                <button type="button" class="btn silver w-[6rem]" @click="onClose()">{{ $t("button.cancel") }}</button>
                <button type="button" class="btn red w-[6rem]" @click="onDelete()">{{ $t("button.delete") }}</button>
                <button type="submit" class="btn w-[6rem]">{{ $t("button.save") }}</button>
            </div>
        </form>
    </Modal>
    <Confirm ref="confirm"></Confirm>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue'
import { t } from '@/i18n'
import { deliveryStaffStore } from '@/store/deliveryStaff';
import { ACTIVE_LIST } from '@/constant';

const { show, data } = defineProps(['show', 'data'])
const emit = defineEmits(['close', 'save'])
const title = "Chi tiết NV giao nhận"
const disable = ref(false)

const payload = ref({
    id: null,
    DeliveryStaffName: null,
    DeliveryStaffActive: null,
})
const confirm = ref(null)
const reload = ref(false)

const onClose = () => {
    emit('close', reload.value)
}

const onSave = async () => {
    console.log(payload.value)
    const res = await deliveryStaffStore.update(payload.value).then((res) => {
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

const onDelete = async () => {
    const ok = await confirm.value.show({
        title: t("title.confirm"),
        message: `Xác nhận xóa NVGN: ${data.DeliveryStaffName}`,
        cancelButton: t("button.back"),
    })
    if(ok) {
        await confirm.value.close()
        const res = await deliveryStaffStore.destroy({id: payload.value.id}).then((res) => {
            if (res && res.code == 200) {
                reload.value = true
                return true
            }
            return false
        })
        if(res) {
            emit('save', reload.value)
        }
    }
}

onMounted(async () => {
    payload.value = data
})
</script>