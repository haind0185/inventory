<template>
    <Modal :show="show" :title="title" maxWidth="max-w-7xl" @close="onClose()" class="">
        <form class="flex flex-col justify-between h-full gap-1 p-2" style="height: 40rem;" @submit.prevent="onSave()">
            <div class="flex gap-4">
                <fieldset class="w-[20%] form-input required">
                    <legend>{{ $t("attr.exit.ExitCode") }}</legend>
                    <input type="text" class="w-full text-center form-control" required v-model="payload.ExitCode">
                </fieldset>
                <fieldset class="w-[20%] form-input required">
                    <legend>{{ $t("attr.exit.ExitDate") }}</legend>
                    <date class="w-full from-control" v-model="payload.ExitDate" required></date>
                </fieldset>
                <div class="w-[20%] mt-2">
                    <div class="h-[21px]"></div>
                    <label class="flex items-center gap-1 text-sm">
                        <input type="checkbox" v-model="payload.ExitType" >
                        {{ $t("attr.exit.ExitType") }}
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
                        {{ exits.length ? exits.length : '' }}
                    </span>
                </div>
                <fieldset class="flex-1 form-input required">
                    <legend>{{ $t("attr.exit.ProductCode") }}</legend>
                </fieldset>
                <fieldset class="w-[8rem] form-input">
                    <legend>{{ $t("attr.exit.LargeUnitQty") }}</legend>
                </fieldset>
                <fieldset class="w-[8rem] form-input">
                    <legend>{{ $t("attr.exit.SmallUnitQty") }}</legend>
                </fieldset>
                <fieldset class="w-[5rem] form-input">
                    <legend>{{ $t("attr.entry.Price") }}</legend>
                </fieldset>
                <fieldset class="w-[7rem] form-input">
                    <legend>{{ $t("attr.entry.PriceQty") }}</legend>
                </fieldset>
            </div>
            
            <div class="flex-1 px-1 py-2" style="overflow: auto; border-top: 1px solid gray; border-bottom: 1px solid gray;">
                <template v-for="(exit, index) in exits">
                    <div class="flex w-full gap-3 entry-item">
                        <div class="flex items-center text-sm w-[3rem] gap-1" style="margin-bottom: -3px;">
                            <div class="flex-1">
                                <span class="close-item" @click="deleteItem(index)" v-if="exits.length > 1">✕</span>
                            </div>
                            <span class="w-[2rem] text-end">
                                {{ index+1  }}
                            </span>
                        </div>
                        <fieldset class="flex-1 form-input required">
                            <select2 class="form-control" required :options="inventories" v-model="exit.ProductCode" label="ProductNameLabelGroup" :reduce="item => item.ProductCode" :option:selected="changeProduct(exit)">
                                <template #search="{attributes, events}">
                                    <input class="vs__search" :required="exit.ProductCode == null || exit.ProductCode == ''" v-bind="attributes" v-on="events" />
                                </template>
                            </select2>
                        </fieldset>
                        <fieldset class="w-[8rem] form-input flex items-center">
                            <input type="number" class="w-[5rem] text-right form-control" v-model="exit.LargeUnitQty" min="0">
                            <span class="w-[3rem] text-sm pl-1">{{ getLargeUnit(exit.ProductCode) }}</span>
                        </fieldset>
                        <fieldset class="w-[8rem] form-input flex items-center">
                            <input type="number" class="w-[5rem] text-right form-control" v-model="exit.SmallUnitQty" min="0" :disabled="smallUnitDisable(exit.ProductCode)">
                            <span class="w-[3rem] text-sm pl-1">{{ getSmallUnit(exit.ProductCode) }}</span>
                        </fieldset>
                        <fieldset class="w-[5rem] form-input flex items-center">
                            <input type="text" class="w-[5rem] text-right form-control" v-model="exit.PriceLabel" disabled>
                        </fieldset>
                        <fieldset class="w-[7rem] form-input flex items-center">
                            <input type="text" class="w-[7rem] text-right form-control" v-model="exit.PriceQtyLabel" disabled>
                        </fieldset>
                    </div>
                </template>
            </div>

            <div class="">
                <div class="flex justify-end h-6 px-5">Tổng: {{ PriceQtyTotal() }}</div>
                <div class="flex justify-around w-full">
                    <button type="button" class="btn silver w-[6rem]" @click="onClose()">{{ $t("button.cancel") }}</button>
                    <button type="submit" class="btn w-[6rem]" :disabled="exits.length <= 0">{{ $t("button.save") }}</button>
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
import { exitStore } from '@/store/exit';
import { helper } from '@/helper'
import { computed } from 'vue';

const title = t("modal.add_exit")
const props = defineProps(['show'])
const emit = defineEmits(['close', 'save'])

const payload = computed(() => exitStore.payload)

const exits = computed(() => exitStore.exits)
const inventories = computed(() => exitStore.inventories)
const confirm = ref(null)
const reload = ref(false)
const file = ref(null)
const price_total = ref(0)

const onClose = () => {
    emit('close', reload.value)
}

const addItem = () => {
    exitStore.add()
}

const deleteItem = (index) => {
    exitStore.delete(index)
}

const reset = () => {
    exitStore.reset()
}

const getLargeUnit = (ProductCode) => {
    let product = exitStore.getProduct(ProductCode)
    if(product) {
        return product.LargeUnit
    }
    return ''
}

const getSmallUnit = (ProductCode) => {
    let product = exitStore.getProduct(ProductCode)
    if(product) {
        return product.SmallUnit
    }
    return ''
}

const smallUnitDisable = (ProductCode) => {
    let product = exitStore.getProduct(ProductCode)
    if(!product || !product.SmallUnit) {
        return true
    }
    return false
}

const changeProduct = (exit) => {
    let product = exitStore.getProduct(exit.ProductCode)

    if(!product || !product.SmallUnit) {
        exit.SmallUnitQty = 0
    }

    if(product) {
        exit.Price = product.Price
        exit.PriceLabel = helper.format_number(exit.Price)

        exit.PriceQty = helper.unitQtyTransfer(exit.LargeUnitQty, exit.SmallUnitQty, product) * exit.Price
        exit.PriceQtyLabel = helper.format_number(exit.PriceQty)
    } else {
        exit.Price = 0
        exit.PriceLabel = helper.format_number(exit.Price)

        exit.PriceQty = 0
        exit.PriceQtyLabel = helper.format_number(exit.PriceQty)
    }
}

const PriceQtyTotal = () => {
    let errors = []
    const total = exits.value.reduce((sum, item, index) => {
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
        await exitStore.import(formData).then((res) => {
            if(res && res.code == 200) {
                setExits(res.data)
            }
        })
    }
}

const setExits = (data) => {
    exitStore.reset()
    for(const i in data) {
        let exit = {...exitStore.exitInit}

        if(data[i].ProductCode) {
            exit.ProductCode = data[i].ProductCode
        }
        if(data[i].LargeUnitQty || data[i].LargeUnitQty == 0) {
            exit.LargeUnitQty = data[i].LargeUnitQty
        }
        if(data[i].SmallUnitQty || data[i].SmallUnitQty == 0) {
            exit.SmallUnitQty = data[i].SmallUnitQty
        }

        exitStore.setExit(exit)
    }
}

/**
 * Call API
 */
const onSave = async () => {
    const ok = await confirm.value.show({
        title: t("title.confirm"),
        message: 'Xác nhận xuất kho có tổng giá trị: '+price_total.value,
        cancelButton: t("button.back"),
    })
    if(ok) {

        payload.value.exits = exits.value
    
        const res = await exitStore.store(payload.value).then((res) => {
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
            exitStore.reset()
            emit('save', reload.value)
        }
    }
}

</script>