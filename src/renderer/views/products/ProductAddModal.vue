<template>
    <Modal :show="show" :title="title" maxWidth="max-w-3xl" @close="onClose()">
        <form class="flex flex-col gap-1 p-2" @submit.prevent="onSave()">
            <div class="flex gap-3">
                <fieldset class="w-2/3 form-input required">
                    <legend>{{ $t("attr.product.name") }}</legend>
                    <input type="text" class="w-full form-control" required v-model="payload.name">
                </fieldset>
                <fieldset class="w-1/3 form-input">
                    <legend>{{ $t("attr.product.SKU") }}</legend>
                    <input type="text" class="w-full form-control" v-model="payload.SKU">
                </fieldset>
            </div>
            <div class="flex gap-3">
                <div class="flex w-2/3 gap-3">
                    <fieldset class="w-1/2 form-input required">
                        <legend>{{ $t("attr.product.unit") }}</legend>
                        <select2 class="form-control" required :options="optionsList" v-model="payload.unit" label="value" :reduce="item => item.value">
                            <template #search="{attributes, events}">
                                <input class="vs__search" :required="payload.unit == null || payload.unit == ''" v-bind="attributes" v-on="events" />
                            </template>
                        </select2>
                    </fieldset>
                    <fieldset class="w-1/2 form-input">
                        <legend>{{ $t("attr.product.price") }}</legend>
                        <input type="number" class="w-full form-control" v-model="payload.price">
                    </fieldset>
                </div>
                <fieldset class="w-1/3 form-input">
                    <legend>{{ $t("attr.product.expire") }} (days)</legend>
                    <input type="number" class="w-full form-control" v-model="payload.expire">
                </fieldset>
            </div>

            <div class="flex">
                <fieldset class="w-full form-input">
                    <legend>{{ $t("attr.product.remark") }}</legend>
                    <textarea class="w-full form-control min-h-12" v-model="payload.remark"></textarea>
                </fieldset>
            </div>

            <div class="flex justify-around w-full mt-5">
                <button type="button" class="btn silver w-[6rem]" @click="onClose()">{{ $t("button.cancel") }}</button>
                <button type="submit" class="btn w-[6rem]">{{ $t("button.save") }}</button>
            </div>
        </form>
    </Modal>
    <Confirm ref="confirm"></Confirm>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { t } from '@/i18n'
import { productStore } from '@/store/product';

const title = t("modal.add_product")
const props = defineProps(['show'])
const emit = defineEmits(['close', 'save'])
const payload = ref({
    name: null,
    SKU: null,
    unit: null,
    price: 0,
    expire: null,
    remark: null
})
const confirm = ref(null)
const reload = ref(false)
const optionsList = ref([
    { value: 'a' },
    { value: 'b' },
    { value: 'c' },
    { value: 'd' },
])


const onClose = () => {
    emit('close', reload.value)
}


const onSave = async () => {
    const res = await productStore.store(payload.value).then((res) => {
        if(res && res.code == 200) {
            reload.value = true
            return true
        }
        return false
    })
    if(res) {
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