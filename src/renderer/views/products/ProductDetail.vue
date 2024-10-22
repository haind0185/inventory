<template>
    <Modal :show="show" :title="title" maxWidth="max-w-3xl" @close="onClose()" class="">
        <form class="flex flex-col justify-between h-full gap-1 p-2" @submit.prevent="onSave()">
            <div class="flex-col gap-1 d-flex">
                <div class="flex gap-3">
                    <fieldset class="w-[20%] form-input required">
                        <legend>{{ $t("attr.product.ProductCode") }}</legend>
                        <input type="text" class="w-full text-center form-control" required
                            v-model="payload.ProductCode" disabled>
                    </fieldset>
                    <fieldset class="w-[60%] form-input required">
                        <legend>{{ $t("attr.product.ProductName") }}</legend>
                        <input type="text" class="w-full form-control" required v-model="payload.ProductName">
                    </fieldset>
                    <fieldset class="w-[20%] form-input required">
                        <legend>{{ $t("attr.product.Expire") }}</legend>
                        <input type="number" class="w-full text-center form-control" required v-model="payload.Expire"
                            min="0">
                    </fieldset>
                </div>
                <div class="flex gap-3">
                    <fieldset class="w-1/3 form-input required">
                        <legend>{{ $t("attr.product.LargeUnit") }}</legend>
                        <select2 class="form-control" required :options="optionsList" v-model="payload.LargeUnit">
                            <template #search="{ attributes, events }">
                                <input class="vs__search"
                                    :required="payload.LargeUnit == null || payload.LargeUnit == ''" v-bind="attributes"
                                    v-on="events" />
                            </template>
                        </select2>
                    </fieldset>
                    <div class="flex w-2/3 gap-3">
                        <fieldset class="w-1/2 form-input">
                            <legend>{{ $t("attr.product.SmallUnit") }}</legend>
                            <select2 class="form-control" :options="optionsList" v-model="payload.SmallUnit"
                                :clearable="true"></select2>
                        </fieldset>
                        <fieldset class="w-1/2 form-input" :class="{ 'required': payload.SmallUnit }">
                            <legend>{{ $t("attr.product.ConversionRate") }} <span class="text-xs text-gray-300">(Đv1 x
                                    QC = Đv2)</span>
                            </legend>
                            <input type="number" class="w-full text-center form-control" :required="payload.SmallUnit"
                                :disabled="!payload.SmallUnit || disable" v-model="payload.ConversionRate" min="1">
                        </fieldset>
                    </div>
                </div>
            </div>

            <div class="flex justify-around w-full mt-[10rem]">
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
import { productStore } from '@/store/product';
import { UNIT } from '@/constant';

const { show, data } = defineProps(['show', 'data'])
const emit = defineEmits(['close', 'save'])
const title = t("modal.detail_product")
const disable = ref(false)

const payload = ref({
    ProductCode: null,
    ProductName: null,
    Expire: null,
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
    const res = await productStore.update(payload.value).then((res) => {
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