<template>
    <Modal :show="show" :title="title" maxWidth="max-w-3xl" @close="onClose()" class="">
        <div class="flex flex-col gap-3 p-2">
            <div class="flex justify-end">
                <input id="file" ref="file" type="file" @change="onFileChange($event)" class="hidden">
                <button type="button" class="btn green" @click="openFile()">{{ $t('button.import') }}</button>
            </div>
            <div class="flex-col gap-1 d-flex">
                <div class="flex gap-3">
                    <fieldset class="w-[20%] form-input required">
                        <legend>{{ $t("attr.product.ProductCode") }}</legend>
                        <input type="text" class="w-full text-center form-control" required v-model="payload.ProductCode">
                    </fieldset>
                    <fieldset class="w-[60%] form-input required">
                        <legend>{{ $t("attr.product.ProductName") }}</legend>
                        <input type="text" class="w-full form-control" required v-model="payload.ProductName">
                    </fieldset>
                    <fieldset class="w-[20%] form-input required">
                        <legend>{{ $t("attr.product.Expire") }}</legend>
                        <input type="number" class="w-full text-center form-control" required v-model="payload.Expire">
                    </fieldset>
                </div>

                <div class="flex gap-3">
                    <fieldset class="w-1/3 form-input required">
                        <legend>{{ $t("attr.product.LargeUnit") }}</legend>
                        <select2 class="form-control" required :options="optionsList" v-model="payload.LargeUnit">
                            <template #search="{attributes, events}">
                                <input class="vs__search" :required="payload.LargeUnit == null || payload.LargeUnit == ''" v-bind="attributes" v-on="events" />
                            </template>
                        </select2>
                    </fieldset>
                    <div class="flex w-2/3 gap-3">
                        <fieldset class="w-1/2 form-input">
                            <legend>{{ $t("attr.product.SmallUnit") }}</legend>
                            <select2 class="form-control" :options="optionsList" v-model="payload.SmallUnit" :clearable="true"></select2>
                        </fieldset>
                        <fieldset class="w-1/2 form-input" :class="{'required': payload.SmallUnit}">
                            <legend>{{ $t("attr.product.ConversionRate") }} <span class="text-xs text-gray-300">(Đv2 x Quycách = Đv1)</span></legend>
                            <input type="number" class="w-full text-center form-control" min="0" :required="payload.SmallUnit" :disabled="!payload.SmallUnit" v-model="payload.ConversionRate">
                        </fieldset>
                    </div>
                </div>
            </div>
        </div>
    </Modal>
    <Confirm ref="confirm"></Confirm>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue'
import { t } from '@/i18n'
import { productStore } from '@/store/product';
import { UNIT } from '@/constant';

const props = defineProps(['show'])
const emit = defineEmits(['close', 'save'])
const title = t("modal.add_product")

const confirm = ref(null)
const reload = ref(false)
const optionsList = ref(UNIT)
const file = ref(null)
const payload = ref({
    ProductCode: null,
    ProductName: null,
    LargeUnit: UNIT[0],
    SmallUnit: null,
    ConversionRate: null,
    Expire: null,
})

const onClose = () => {
    emit('close', reload.value)
}

const openFile = () => {
    file.value.value = null
    file.value.click()
}

const onFileChange = async (e) => {
    let file = e.target.files ? e.target.files[0] : null
    if(file) {
        let formData = new FormData();
        formData.append('file', file);
        await productStore.import(formData).then((res) => {
            console.log(res)
        })
    }
}

const onSave = async () => {
    
}

</script>