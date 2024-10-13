<template>
    <Modal :show="show" :title="title" maxWidth="max-w-3xl" @close="onClose()" class="">
        <form class="flex flex-col justify-between h-full gap-1 p-2" @submit.prevent="onSave()">
            <div class="flex-col gap-1 d-flex">
                <div class="flex gap-3">
                    <fieldset class="w-1/3 form-input required">
                        <legend>{{ $t("attr.product.code") }}</legend>
                        <input type="text" class="w-full text-center form-control" required v-model="payload.code">
                    </fieldset>
                    <fieldset class="w-2/3 form-input required">
                        <legend>{{ $t("attr.product.name") }}</legend>
                        <input type="text" class="w-full form-control" required v-model="payload.name">
                    </fieldset>
                </div>
                <div class="flex gap-3">
                    <fieldset class="w-1/3 form-input required">
                        <legend>{{ $t("attr.product.unit1") }}</legend>
                        <select2 class="form-control" required :options="optionsList" v-model="payload.unit1">
                            <template #search="{attributes, events}">
                                <input class="vs__search" :required="payload.unit1 == null || payload.unit1 == ''" v-bind="attributes" v-on="events" />
                            </template>
                        </select2>
                    </fieldset>
                    <div class="flex w-2/3 gap-3">
                        <fieldset class="w-1/2 form-input">
                            <legend>{{ $t("attr.product.unit2") }}</legend>
                            <select2 class="form-control" :options="optionsList" v-model="payload.unit2" :clearable="true"></select2>
                        </fieldset>
                        <fieldset class="w-1/2 form-input" :class="{'required': payload.unit2}">
                            <legend>{{ $t("attr.product.specific") }} <span class="text-xs text-gray-300">(Đv2 x Quycách = Đv1)</span></legend>
                            <input type="number" class="w-full text-center form-control" min="1" :required="payload.unit2" :disabled="!payload.unit2" v-model="payload.specific">
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

const props = defineProps(['show'])
const emit = defineEmits(['close', 'save'])
const title = t("modal.add_product")

const payload = ref({
    code: null,
    name: null,
    unit1: UNIT[0],
    unit2: null,
    specific: null,
})
const confirm = ref(null)
const reload = ref(false)
const optionsList = ref(UNIT)

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

watch(
    payload,
    async () => {
        if (!payload.value.unit2) {
            payload.value.specific = null
        }
    },
    { deep: true }
)
</script>