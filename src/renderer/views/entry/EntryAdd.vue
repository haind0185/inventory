<template>
    <Modal :show="show" :title="title" maxWidth="max-w-7xl" @close="onClose()" class="">
        <form class="flex flex-col justify-between h-full gap-1 p-2" style="height: 40rem;" @submit.prevent="onSave()">
            <div class="flex gap-4">
                <fieldset class="w-[20%] form-input required">
                    <legend>{{ $t("attr.entry.EntryCode") }}</legend>
                    <input type="text" class="w-full text-center form-control" required v-model="payload.EntryCode">
                </fieldset>
                <fieldset class="w-[20%] form-input required">
                    <legend>{{ $t("attr.entry.EntryDate") }}</legend>
                    <date class="w-full from-control" v-model="payload.EntryDate" required></date>
                </fieldset>
                <div class="w-1/3 mt-2">
                    <div class="h-[21px]"></div>
                    <label class="flex items-center gap-1 text-sm">
                        <input type="checkbox" v-model="payload.EntryType" >
                        {{ $t("attr.entry.EntryType") }}
                    </label>
                </div>
            </div>

            <div class="flex justify-end gap-3">
                <button type="button" class="btn green w-[6rem]" @click="addItem()">{{ t('button.add_item') }}</button>
                <input id="file" ref="file" type="file" @change="onFileChange($event)" class="hidden">
                <button type="button" class="btn silver w-[6rem]" @click="openFile()">{{ $t('button.import') }}</button>
                <button type="button" class="btn silver w-[6rem]" @click="reset()">{{ t('button.reset') }}</button>
            </div>

            <div class="flex gap-3 p-1 entry-item">
                <div class="w-[3rem] justify-center items-end flex">
                    <div class="flex-1"></div>
                    <span class="w-[2rem] text-end text-sm">
                        {{ entries.length ? entries.length : '' }}
                    </span>
                </div>
                <fieldset class="flex-1 form-input required">
                    <legend>{{ $t("attr.entry.ProductCode") }}</legend>
                </fieldset>
                <fieldset class="w-[7.5rem] form-input required">
                    <legend>{{ $t("attr.entry.ExpiryDate") }}</legend>
                </fieldset>
                <fieldset class="w-[8rem] form-input">
                    <legend>{{ $t("attr.entry.LargeUnitQty") }}</legend>
                </fieldset>
                <fieldset class="w-[8rem] form-input">
                    <legend>{{ $t("attr.entry.SmallUnitQty") }}</legend>
                </fieldset>
                <fieldset class="w-[5rem] form-input">
                    <legend>{{ $t("attr.entry.Price") }}</legend>
                </fieldset>
                <fieldset class="w-[7rem] form-input">
                    <legend>{{ $t("attr.entry.PriceQty") }}</legend>
                </fieldset>
            </div>

            <div class="flex-1 px-1 py-2" style="overflow: auto; border-top: 1px solid gray; border-bottom: 1px solid gray;">
                <template v-for="(entry, index) in entries">
                    <div class="flex w-full gap-3 entry-item">
                        <div class="flex items-center text-sm w-[3rem] gap-1" style="margin-bottom: -3px;">
                            <div class="flex-1">
                                <span class="close-item" @click="deleteItem(index)" v-if="entries.length > 1">✕</span>
                            </div>
                            <span class="w-[2rem] text-end">
                                {{ index+1  }}
                            </span>
                        </div>
                        <fieldset class="flex-1 form-input required">
                            <select2 class="form-control" required :options="products" v-model="entry.ProductCode" label="ProductNameLabel" :reduce="item => item.ProductCode" :option:selected="changeProduct(entry)">
                                <template #search="{attributes, events}">
                                    <input class="vs__search" :required="entry.ProductCode == null || entry.ProductCode == ''" v-bind="attributes" v-on="events" />
                                </template>
                            </select2>
                        </fieldset>
                        <fieldset class="w-[7.5rem] form-input required">
                            <date class="w-full from-control" v-model="entry.ExpiryDate" required></date>
                        </fieldset>
                        <fieldset class="w-[8rem] form-input flex items-center">
                            <input type="number" class="w-[5rem] text-center form-control" v-model="entry.LargeUnitQty" min="0">
                            <span class="w-[3rem] text-sm pl-1">{{ getLargeUnit(entry.ProductCode) }}</span>
                        </fieldset>
                        <fieldset class="w-[8rem] form-input flex items-center">
                            <input type="number" class="w-[5rem] text-center form-control" v-model="entry.SmallUnitQty" min="0" :disabled="smallUnitDisable(entry.ProductCode)">
                            <span class="w-[3rem] text-sm pl-1">{{ getSmallUnit(entry.ProductCode) }}</span>
                        </fieldset>
                        <fieldset class="w-[5rem] form-input flex items-center">
                            <input type="text" class="w-[5rem] text-right form-control" v-model="entry.PriceLabel" disabled>
                        </fieldset>
                        <fieldset class="w-[7rem] form-input flex items-center">
                            <input type="text" class="w-[7rem] text-right form-control" v-model="entry.PriceQtyLabel" disabled>
                        </fieldset>
                    </div>
                </template>
            </div>

            <div class="">
                <div class="flex justify-end h-6 px-5">Tổng: {{ PriceQtyTotal() }}</div>
                <div class="flex justify-around w-full">
                    <button type="button" class="btn silver w-[6rem]" @click="onClose()">{{ $t("button.cancel") }}</button>
                    <button type="submit" class="btn w-[6rem]" :disabled="entries.length <= 0">{{ $t("button.save") }}</button>
                </div>
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
import { onMounted, onBeforeMount, ref, watch } from 'vue'
import { t } from '@/i18n'
import { productStore } from '@/store/product';
import { entryStore } from '@/store/entry';
import { helper } from '@/helper'
import { computed } from 'vue';

const title = t("modal.add_entry")
const props = defineProps(['show'])
const emit = defineEmits(['close', 'save'])

const payload = computed(() => entryStore.payload)

const entries = computed(() => entryStore.entries)
const products = computed(() => entryStore.products)
const confirm = ref(null)
const reload = ref(false)
const file = ref(null)
const price_total = ref(null)

const onClose = () => {
    emit('close', reload.value)
}

const getLargeUnit = (ProductCode) => {
    let product = entryStore.getProduct(ProductCode)
    if(product) {
        return product.LargeUnit
    }
    return ''
}

const getSmallUnit = (ProductCode) => {
    let product = entryStore.getProduct(ProductCode)
    if(product) {
        return product.SmallUnit
    }
    return ''
}

const smallUnitDisable = (ProductCode) => {
    let product = entryStore.getProduct(ProductCode)
    if(!product || !product.SmallUnit) {
        return true
    }
    return false
}

const changeProduct = (entry) => {
    let product = entryStore.getProduct(entry.ProductCode)

    if(!product || !product.SmallUnit) {
        entry.SmallUnitQty = 0
    }
    if(product) {
        entry.Price = product.Price
        entry.PriceLabel = helper.format_number(entry.Price)

        entry.PriceQty = helper.unitQtyTransfer(entry.LargeUnitQty, entry.SmallUnitQty, product) * entry.Price
        entry.PriceQtyLabel = helper.format_number(entry.PriceQty)
    } else {
        entry.Price = 0
        entry.PriceLabel = helper.format_number(entry.Price)

        entry.PriceQty = 0
        entry.PriceQtyLabel = helper.format_number(entry.PriceQty)
    }
}

const PriceQtyTotal = () => {
    let errors = []
    const total = entries.value.reduce((sum, item, index) => {
        if(item.PriceQty != 0 && !item.PriceQty) {
            errors.push(index + 1)
        }
        return sum + item.PriceQty
    }, 0)

    if(errors.length > 0) {
        confirm.value.show({
            title: t("title.error"),
            message: `Các dòng sau bị lỗi: `+errors.join(', '),
            type: 3
        })
    }

    price_total.value = total ? helper.format_number(total ?? 0) : ''

    return price_total.value
}

const addItem = () => {
    entryStore.add()
}

const deleteItem = (index) => {
    entryStore.delete(index)
}

const reset = () => {
    entryStore.reset()
}

onBeforeMount(async () => {
})

const openFile = () => {
    file.value.value = null
    file.value.click()
}

const onFileChange = async (e) => {
    let file = e.target.files ? e.target.files[0] : null
    if(file) {
        let formData = new FormData();
        formData.append('file', file);
        await entryStore.import(formData).then((res) => {
            if(res && res.code == 200) {
                setEntries(res.data)
            }
        })
    }
}

const setEntries = (data) => {
    entryStore.reset()
    for(const i in data) {
        let entry = {...entryStore.entryInit}

        if(data[i].ProductCode) {
            entry.ProductCode = data[i].ProductCode
        }
        
        if(data[i].ExpiryDate) {
            entry.ExpiryDate = data[i].ExpiryDate
        }
        if(data[i].LargeUnitQty || data[i].LargeUnitQty == 0) {
            entry.LargeUnitQty = data[i].LargeUnitQty
        }
        if(data[i].SmallUnitQty || data[i].SmallUnitQty == 0) {
            entry.SmallUnitQty = data[i].SmallUnitQty
        }

        entryStore.setEntry(entry)
    }
}

/**
 * Call API
 */
const onSave = async () => {
    const ok = await confirm.value.show({
        title: t("title.confirm"),
        message: 'Xác nhận nhập kho có tổng giá trị: '+price_total.value,
        cancelButton: t("button.back"),
    })
    if(ok) {
        payload.value.entries = entries.value
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
            entryStore.reset()
            emit('save', reload.value)
        }
    }

}

</script>