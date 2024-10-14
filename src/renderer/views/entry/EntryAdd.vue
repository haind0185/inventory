<template>
    <Modal :show="show" :title="title" maxWidth="max-w-5xl" @close="onClose()" class="">
        <form class="flex flex-col justify-between h-full gap-1 p-2 min-h-96" @submit.prevent="onSave()">
            <div class="flex-col gap-1 d-flex">
                <div class="flex gap-3 w-[50%] mx-auto">
                    <fieldset class="w-1/2 form-input required">
                        <legend>{{ $t("attr.entry.EntryCode") }}</legend>
                        <input type="text" class="w-full text-center form-control" required v-model="payload.EntryCode">
                    </fieldset>
                    <fieldset class="w-1/2 form-input required">
                        <legend>{{ $t("attr.entry.EntryDate") }}</legend>
                        <date class="w-full from-control" v-model="payload.EntryDate" required></date>
                    </fieldset>
                </div>
                <div>
                    <div class="flex gap-3 p-1 entry-item">
                        <div class="w-[1rem]"></div>
                        <fieldset class="w-[50%] form-input required">
                            <legend>{{ $t("attr.entry.ProductCode") }}</legend>
                        </fieldset>
                        <fieldset class="w-[10%] form-input required">
                            <legend>{{ $t("attr.entry.LargeUnitQty") }}</legend>
                        </fieldset>
                        <fieldset class="w-[10%] form-input required">
                            <legend>{{ $t("attr.entry.SmallUnitQty") }}</legend>
                        </fieldset>
                        <fieldset class="w-[20%] form-input required">
                            <legend>{{ $t("attr.entry.ExpiryDate") }}</legend>
                        </fieldset>
                    </div>
                </div>
                <div class="entry">
                    <template v-for="(entry, index) in entries">
                        <div class="flex gap-3 p-1 entry-item">
                            <div class="flex items-end text-sm" style="margin-bottom: 2px;">{{ index+1  }}</div>
                            <fieldset class="w-[50%] form-input required">
                                <!-- <legend>{{ $t("attr.entry.ProductCode") }}</legend> -->
                                <input type="text" class="w-full text-center form-control" required v-model="entry.ProductCode">
                            </fieldset>
                            <fieldset class="w-[10%] form-input required">
                                <!-- <legend>{{ $t("attr.entry.LargeUnitQty") }}</legend> -->
                                <input type="text" class="w-full text-center form-control" required v-model="entry.LargeUnitQty">
                            </fieldset>
                            <fieldset class="w-[10%] form-input required">
                                <!-- <legend>{{ $t("attr.entry.SmallUnitQty") }}</legend> -->
                                <input type="text" class="w-full text-center form-control" required v-model="entry.SmallUnitQty">
                            </fieldset>
                            <fieldset class="w-[20%] form-input required">
                                <!-- <legend>{{ $t("attr.entry.ExpiryDate") }}</legend> -->
                                <input type="text" class="w-full text-center form-control" required v-model="entry.ExpiryDate">
                            </fieldset>
                        </div>
                    </template>
                </div>
            </div>

            <div class="flex justify-around w-full mt-[2rem]">
                <button type="button" class="btn silver w-[6rem]" @click="onClose()">{{ $t("button.cancel") }}</button>
                <button type="submit" class="btn w-[6rem]">{{ $t("button.save") }}</button>
            </div>
        </form>
    </Modal>
    <Confirm ref="confirm"></Confirm>
</template>
<style scoped>
.entry .entry-item {
    border-left: 1px solid #ccc;
    border-right: 1px solid #ccc;
    border-bottom: 1px solid #ccc;
}
.entry .entry-item:first-of-type {
    border-top: 1px solid #ccc;
}
</style>

<script setup>
import { onMounted, ref, watch } from 'vue'
import { t } from '@/i18n'
import { productStore } from '@/store/product';
import { UNIT } from '@/constant';

const props = defineProps(['show'])
const emit = defineEmits(['close', 'save'])
const title = t("modal.add_entry")

const payload = ref({
    EntryCode: null,
    EntryDate: null,
})
const entryInit = {
    ProductCode: null,
    LargeUnitQty: null,
    SmallUnitQty: null,
    ExpiryDate: null,
}
const entries = ref([
    {...entryInit},
    {...entryInit},
    {...entryInit},
    {...entryInit},
    {...entryInit},
    {...entryInit},
    {...entryInit},
    {...entryInit},
    {...entryInit},
])
const confirm = ref(null)
const reload = ref(false)
const optionsList = ref(UNIT)

const onClose = () => {
    emit('close', reload.value)
}

const onSave = async () => {
    console.log(entries)
    // const res = await productStore.store(payload.value).then((res) => {
    //     if(res && res.code == 200) {
    //         reload.value = true
    //         return true
    //     }
    //     return false
    // })
    // if(res) {
    //     await confirm.value.show({
    //         title: t("title.notify"),
    //         message: t("msg.save_ok"),
    //         cancelButton: t("button.back"),
    //         type: 1
    //     })
    //     emit('save', reload.value)
    // }

}

watch(
    payload,
    async () => {
        if (!payload.value.SmallUnit) {
            payload.value.ConversionRate = null
        }
    },
    { deep: true }
)
</script>