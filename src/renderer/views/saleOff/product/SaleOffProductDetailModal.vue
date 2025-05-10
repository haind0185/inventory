<template>
    <Modal :show="show" :title="title" maxWidth="max-w-lg" @close="onClose()" class="">
        <form class="flex flex-col justify-between h-full gap-1 p-2" @submit.prevent="onSave()">
            <div class="flex-col gap-1 d-flex">
                <!-- ProductCode -->
                <fieldset class="w-[100%] form-input required">
                    <legend>Mã sản phẩ<math></math></legend>
                    <input type="text" class="w-full text-center form-control" required
                        v-model="payload.ProductCode" disabled>
                </fieldset>

                <!-- ProductName -->
                <fieldset class="w-[100%] form-input required">
                    <legend>Tên sản phẩm</legend>
                    <input type="text" class="w-full form-control" required v-model="payload.ProductName">
                </fieldset>

                <!-- Expire, Price -->
                <div class="flex gap-3">
                    <fieldset class="w-[50%] form-input required">
                        <legend>{{ $t("attr.product.Price") }}</legend>
                        <input type="number" class="w-full text-right form-control" required v-model="payload.Price" min="0">
                    </fieldset>
                </div>

                <!-- LargeUnit, SmallUnit, ConversionRate -->
                <div class="flex gap-3">
                    <fieldset class="w-[30%] form-input required">
                        <legend>{{ $t("attr.product.LargeUnit") }}</legend>
                        <select2 class="form-control" required :options="optionsList" v-model="payload.LargeUnit">
                            <template #search="{ attributes, events }">
                                <input class="vs__search"
                                    :required="payload.LargeUnit == null || payload.LargeUnit == ''" v-bind="attributes"
                                    v-on="events" />
                            </template>
                        </select2>
                    </fieldset>

                    <fieldset class="w-[30%] form-input">
                        <legend>{{ $t("attr.product.SmallUnit") }}</legend>
                        <select2 class="form-control" :options="optionsList" v-model="payload.SmallUnit"
                            :clearable="true"></select2>
                    </fieldset>

                    <fieldset class="w-[40%] form-input" :class="{ 'required': payload.SmallUnit }">
                        <legend>{{ $t("attr.product.ConversionRate") }} <span class="text-xs text-gray-300">(Đv1 x
                                QC = Đv2)</span>
                        </legend>
                        <input type="number" class="w-full text-center form-control" :required="payload.SmallUnit"
                            :disabled="!payload.SmallUnit || disable" v-model="payload.ConversionRate" min="1">
                    </fieldset>
                </div>
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
import { saleOffProductStore } from '@/store/saleOffProduct';
import { UNIT } from '@/constant';

const { show, data } = defineProps(['show', 'data'])
const emit = defineEmits(['close', 'save'])
const title = "Chi tiết sản phẩm"
const disable = ref(false)

const payload = ref({
    ProductCode: null,
    ProductName: null,
    Price: null,
    LargeUnit: UNIT[0],
    SmallUnit: null,
    ConversionRate: null,
})
const confirm = ref(null)
const reload = ref(false)
const optionsList = ref(UNIT)

const onClose = () => {
    emit('close', reload.value)
}

const onSave = async () => {
    const res = await saleOffProductStore.update(payload.value).then((res) => {
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
        message: t("msg.delete_product", {ProductCode: data.ProductCode, ProductName: data.ProductName}),
        cancelButton: t("button.back"),
    })
    if(ok) {
        await confirm.value.close()
        const res = await saleOffProductStore.destroy({ProductCode: payload.value.ProductCode}).then((res) => {
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

watch(
    payload,
    async () => {
        if (!payload.value.SmallUnit && !disable.value) {
            payload.value.ConversionRate = null
        }
    },
    { deep: true }
)

onMounted(async () => {
    payload.value = data
    if(data.inventories && data.inventories.length > 0) {
        disable.value = true
    }
})
</script>