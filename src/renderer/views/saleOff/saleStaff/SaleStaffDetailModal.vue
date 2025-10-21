<template>
    <Modal :show="show" :title="title" maxWidth="max-w-[25rem]" @close="onClose()" class="">
        <form class="flex flex-col justify-between h-full gap-1 p-2" @submit.prevent="onSave()">
            <div class="flex-col gap-1 d-flex">
                <!-- SaleStaffName -->
                <fieldset class="w-[100%] form-input required">
                    <legend>Tên nhân viên</legend>
                    <input type="text" class="w-full form-control" required v-model="payload.SaleStaffName">
                </fieldset>
                
                <!-- SaleStaffActive -->
                <fieldset class="w-[100%] form-input required">
                    <legend>Tình trạng</legend>
                    <template v-if="ACTIVE_LIST">
                        <div class="flex gap-4">
                            <label class="flex items-center gap-1" v-for="[key, value] of Object.entries(ACTIVE_LIST)">
                                <input type="radio" class="" name="title-active-01" :value="key" v-model="payload.SaleStaffActive">{{ value }}
                            </label>
                        </div>
                    </template>
                </fieldset>

                <!-- SaleStaffCustomer -->
                 <fieldset class="w-[100%] form-input">
                    <legend>Danh sách khách hàng</legend>
                    <div class="flex flex-col gap-1">
                        <div v-for="(customer, index) in payload.customers" class="flex items-center gap-2 font-semibold">
                            <IconRemove v-tooltip="{ content: 'Xóa bỏ khách hàng này', placement: 'top' }" @click="removeCustomer(customer.CustomerCode)" ></IconRemove>
                            {{ `${index+1}. ${customer.CustomerNameLabel}` }}
                        </div>
                        <div>
                            <select2 class="form-control" :options="customers()" v-model="customer" label="CustomerNameLabel" :reduce="item => item.CustomerCode" :option:selected="onSelectCustomer()" placeholder="Thêm một khách hàng">
                            </select2>
                        </div>
                    </div>
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
import { saleStaffStore } from '@/store/saleStaff';
import { ACTIVE_LIST } from '@/constant';
import { store } from '@/store'
import IconRemove from '@/views/component/icon/IconRemove.vue'

const { show, data } = defineProps(['show', 'data'])
const emit = defineEmits(['close', 'save'])
const title = "Chi tiết NV bán hàng"
const disable = ref(false)
const master = ref(store.master)

const payload = ref({
    id: null,
    SaleStaffName: null,
    SaleStaffActive: null,
    customers: []
})
const customer = ref(null)
const confirm = ref(null)
const reload = ref(false)
const customers = () => {
    return master.value.customers.filter((item) => {
        return !payload.value.customers.find((i) => i.CustomerCode == item.CustomerCode)
    })
}
const onSelectCustomer = () => {
    if(customer.value) {
        const item = master.value.customers.find((item) => item.CustomerCode == customer.value)
        payload.value.customers.push(item)
        customer.value = null
    }
}
const removeCustomer = (CustomerCode) => {
    payload.value.customers = payload.value.customers.filter((item) => item.CustomerCode != CustomerCode)
}

const onClose = () => {
    emit('close', reload.value)
}

const onSave = async () => {
    console.log(payload.value)
    payload.value.customers = payload.value.customers.map((item) => {
        return item.CustomerCode
    })
    const res = await saleStaffStore.update(payload.value).then((res) => {
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
        message: `Xác nhận xóa NVBH: ${data.SaleStaffName}`,
        cancelButton: t("button.back"),
    })
    if(ok) {
        await confirm.value.close()
        const res = await saleStaffStore.destroy({id: payload.value.id}).then((res) => {
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