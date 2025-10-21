<template>
    <Modal :show="show" :title="title" maxWidth="max-w-[25rem]" @close="onClose()" class="">
        <form class="flex flex-col justify-between h-full gap-1 p-2" @submit.prevent="onSave()">
            <div class="flex-col gap-1 d-flex">
                <!-- CustomerCode -->
                <fieldset class="w-[100%] form-input required">
                    <legend>Mã khách hàng</legend>
                    <input type="text" class="w-full text-center form-control" required v-model="payload.CustomerCode" disabled>
                </fieldset>

                <!-- CustomerCode -->
                <fieldset class="w-[100%] form-input required">
                    <legend>Tên khách hàng</legend>
                    <input type="text" class="w-full form-control" required v-model="payload.CustomerName">
                </fieldset>

                <!-- CustomerCode -->
                <fieldset class="w-[100%] form-input">
                    <legend>Địa chỉ</legend>
                    <input type="text" class="w-full form-control" v-model="payload.CustomerAddress">
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
import { customerStore } from '@/store/customer';

const { show, data } = defineProps(['show', 'data'])
const emit = defineEmits(['close', 'save'])
const title = "Chi tiết khách hàng"

const payload = ref({
    CustomerCode: null,
    CustomerName: null,
    CustomerAddress: null,
})
const confirm = ref(null)
const reload = ref(false)

const onClose = () => {
    emit('close', reload.value)
}

const onSave = async () => {
    console.log(payload.value)
    const res = await customerStore.update(payload.value).then((res) => {
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
        message: `Xác nhận xóa khách hàng: ${data.CustomerCode}`,
        cancelButton: t("button.back"),
    })
    if(ok) {
        await confirm.value.close()
        const res = await customerStore.destroy({CustomerCode: payload.value.CustomerCode}).then((res) => {
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