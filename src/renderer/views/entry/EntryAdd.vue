<template>
    <Modal :show="show" :title="title" maxWidth="max-w-5xl" @close="onClose()" class="">
        <form class="flex flex-col justify-between h-full gap-1 p-2" style="min-height: 500px;" @submit.prevent="onSave()">
            <div class="flex-col gap-1 d-flex">
                <div class="flex gap-3 w-[60%] mx-auto">
                    <fieldset class="w-1/3 form-input required">
                        <legend>{{ $t("attr.entry.EntryCode") }}</legend>
                        <input type="text" class="w-full text-center form-control" required v-model="payload.EntryCode">
                    </fieldset>
                    <fieldset class="w-1/3 form-input required">
                        <legend>{{ $t("attr.entry.EntryDate") }}</legend>
                        <date class="w-full from-control" v-model="payload.EntryDate" required></date>
                    </fieldset>
                    <label class="flex items-center w-1/3 gap-1">
                        <input type="checkbox" v-model="payload.EntryType" >
                        {{ $t("attr.entry.EntryType") }}
                    </label>
                </div>
                <div class="flex justify-end gap-2">
                    <button type="button" class="btn green" @click="addItem()">{{ t('button.add_item') }}</button>
                </div>
                <div>
                    <div class="flex gap-3 p-1 entry-item">
                        <div class="w-[2rem]">{{ ' ' }}</div>
                        <fieldset class="flex-1 form-input required">
                            <legend>{{ $t("attr.entry.ProductCode") }}</legend>
                        </fieldset>
                        <fieldset class="w-[10rem] form-input">
                            <legend>{{ $t("attr.entry.LargeUnitQty") }}</legend>
                        </fieldset>
                        <fieldset class="w-[10rem] form-input">
                            <legend>{{ $t("attr.entry.SmallUnitQty") }}</legend>
                        </fieldset>
                        <fieldset class="w-[8rem] form-input required">
                            <legend>{{ $t("attr.entry.ExpiryDate") }}</legend>
                        </fieldset>
                    </div>
                </div>
                <div class="entry">
                    <template v-for="(entry, index) in entries">
                        <div class="flex w-full gap-3 p-1 entry-item">
                            <div class="flex items-end text-sm w-[2rem]" style="margin-bottom: 2px;">{{ index+1  }}</div>
                            <fieldset class="flex-1 form-input required">
                                <select2 class="form-control" required :options="product_list" v-model="entry.ProductCode" label="ProductNameLabel" :reduce="item => item.ProductCode" :update:modelValue="changeProduct(entry)">
                                    <template #search="{attributes, events}">
                                        <input class="vs__search" :required="entry.ProductCode == null || entry.ProductCode == ''" v-bind="attributes" v-on="events" />
                                    </template>
                                </select2>
                            </fieldset>
                            <fieldset class="w-[10rem] form-input flex items-center">
                                <input type="number" class="w-[7rem] text-center form-control" v-model="entry.LargeUnitQty" min="0">
                                <span class="w-[3rem] text-sm pl-1">{{ getLargeUnit(entry.ProductCode) }}</span>
                            </fieldset>
                            <fieldset class="w-[10rem] form-input flex items-center">
                                <input type="number" class="w-[7rem] text-center form-control" v-model="entry.SmallUnitQty" min="0" :disabled="smallUnitDisable(entry.ProductCode)">
                                <span class="w-[3rem] text-sm pl-1">{{ getSmallUnit(entry.ProductCode) }}</span>
                            </fieldset>
                            <fieldset class="w-[8rem] form-input required">
                                <date class="w-full from-control" v-model="entry.ExpiryDate" required></date>
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
import { entryStore } from '@/store/entry';
import { helper } from '@/helper'

const title = t("modal.add_entry")
const props = defineProps(['show'])
const emit = defineEmits(['close', 'save'])

const payload = ref({
    EntryCode: null,
    EntryDate: null,
    EntryType: false,
})

const entryInit = {
    ProductCode: null,
    LargeUnitQty: 0,
    SmallUnitQty: 0,
    ExpiryDate: null,
}
const entries = ref([
    {...entryInit},
])
const confirm = ref(null)
const reload = ref(false)
const product_list = ref([])
var pro_list = []

const onClose = () => {
    emit('close', reload.value)
}

const onSave = async () => {
    payload.value.entries = entries.value
    console.log(payload.value)
    const res = await entryStore.store(payload.value).then((res) => {
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

const list = async () => {
    await productStore.list().then((res) => {
        if(res && res.code == 200) {
            product_list.value = res.data.items
            pro_list = helper.deepClone(product_list.value)
        }
    })
}

const getLargeUnit = (ProductCode) => {
    let product = pro_list.find(item => {
        return item.ProductCode == ProductCode
    })
    if(product) {
        return product.LargeUnit
    }
    return ''
}

const getSmallUnit = (ProductCode) => {
    let product = pro_list.find(item => {
        return item.ProductCode == ProductCode
    })
    if(product) {
        return product.SmallUnit
    }
    return ''
}

const smallUnitDisable = (ProductCode) => {
    let product = pro_list.find(item => {
        return item.ProductCode == ProductCode
    })
    if(!product?.SmallUnit) {
        return true
    }
    return false
}

const changeProduct = (entry) => {
    let product = pro_list.find(item => {
        return item.ProductCode == entry.ProductCode
    })
    if(!product?.SmallUnit) {
        entry.SmallUnitQty = 0
    }
}

const addItem = () => {
    entries.value.push({...entryInit})
}

onMounted(async () => {
    await list()
})


</script>