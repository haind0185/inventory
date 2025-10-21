<template>
    <Modal :show="show" :title="title" maxWidth="max-w-7xl" @close="onClose()" class="">
        <form class="flex flex-col justify-between h-full gap-1 p-2" style="height: 40rem;" @submit.prevent="onSave()">
            <div class="flex gap-4">
                <fieldset class="w-[20%] form-input required">
                    <legend>Mã nhập hàng</legend>
                    <input type="text" class="w-full text-center form-control" required v-model="payload.StockInCode" disabled>
                </fieldset>
                <fieldset class="w-[20%] form-input required">
                    <legend>Ngày nhập hàng</legend>
                    <date class="w-full from-control" v-model="payload.StockInDate" required></date>
                </fieldset>
                <fieldset class="w-[40%] form-input">
                    <legend>Ghi chú</legend>
                    <input type="text" class="w-full form-control" v-model="payload.StockInNote">
                </fieldset>
            </div>

            <div class="flex justify-end gap-3">
                <button type="button" class="btn green w-[6rem]" @click="addItem()" tabindex="-1">{{ t('button.add_item') }}</button>
                <input id="file" ref="file" type="file" @change="onFileChange($event)" class="hidden">
                <button type="button" class="btn silver w-[6rem]" @click="reset()" tabindex="-1">{{ t('button.reset') }}</button>
            </div>

            <div class="flex gap-3 p-1 entry-item">
                <div class="w-[3rem] justify-center items-end flex">
                    <div class="flex-1"></div>
                    <span class="w-[2rem] text-end text-sm">
                        {{ stockInItems.length ? stockInItems.length : '' }}
                    </span>
                </div>
                <fieldset class="flex-1 form-input required">
                    <legend>{{ 'Mã sản phẩm' }}</legend>
                </fieldset>
                <fieldset class="w-[7rem] form-input">
                    <legend>{{ 'S.L(1)' }}</legend>
                </fieldset>
                <fieldset class="w-[7rem] form-input">
                    <legend>{{ 'S.L(2)' }}</legend>
                </fieldset>
                <fieldset class="w-[5rem] form-input">
                    <legend>{{ 'Đơn giá' }}</legend>
                </fieldset>
                <fieldset class="w-[7rem] form-input">
                    <legend>{{ 'Tổng tiền' }}</legend>
                </fieldset>
                <fieldset class="w-[11rem] form-input">
                    <legend>{{ 'Ghi chú' }}</legend>
                </fieldset>
            </div>

            <div class="flex-1 px-1 py-2" style="overflow: auto; border-top: 1px solid gray; border-bottom: 1px solid gray;">
                <template v-for="(item, index) in stockInItems">
                    <div class="flex w-full gap-3 entry-item">
                        <div class="flex items-center text-sm w-[3rem] gap-1" style="margin-bottom: -3px;">
                            <div class="flex-1">
                                <span class="close-item" @click="deleteItem(index)" v-if="stockInItems.length > 1">✕</span>
                            </div>
                            <span class="w-[2rem] text-end">
                                {{ index+1  }}
                            </span>
                        </div>
                        <fieldset class="flex-1 form-input required">
                            <select2 class="form-control" required :options="products" v-model="item.ProductCode" label="ProductNameLabel" :reduce="item => item.ProductCode" :option:selected="changeProduct(item)">
                                <template #search="{attributes, events}">
                                    <input class="vs__search" :required="item.ProductCode == null || item.ProductCode == ''" v-bind="attributes" v-on="events" />
                                </template>
                            </select2>
                        </fieldset>
                        <fieldset class="w-[7rem] form-input flex items-center">
                            <input type="number" class="w-[4rem] text-center form-control" v-model="item.LargeUnitQty" min="0" v-select-on-focus>
                            <span class="w-[3rem] text-sm pl-1">{{ getLargeUnit(item.ProductCode) }}</span>
                        </fieldset>
                        <fieldset class="w-[7rem] form-input flex items-center">
                            <input type="number" class="w-[4rem] text-center form-control" v-model="item.SmallUnitQty" min="0" :disabled="smallUnitDisable(item.ProductCode)" v-select-on-focus>
                            <span class="w-[3rem] text-sm pl-1">{{ getSmallUnit(item.ProductCode) }}</span>
                        </fieldset>
                        <fieldset class="w-[5rem] form-input flex items-center">
                            <input type="text" class="w-[5rem] text-right form-control" v-model="item.PriceLabel" disabled>
                        </fieldset>
                        <fieldset class="w-[7rem] form-input flex items-center">
                            <input type="text" class="w-[7rem] text-right form-control" v-model="item.PriceQtyLabel" disabled>
                        </fieldset>
                        <fieldset class="w-[11rem] form-input flex items-center">
                            <input type="text" class="w-[11rem] form-control" v-model="item.StockInItemNote" maxlength="200">
                        </fieldset>
                    </div>
                </template>
            </div>

            <div class="">
                <div class="flex justify-end h-6 px-5">Tổng: {{ PriceQtyTotal() }}</div>
                <div class="flex justify-around w-full">
                    <button type="button" class="btn silver w-[6rem]" @click="onClose()" tabindex="-1">{{ $t("button.cancel") }}</button>
                    <button type="submit" class="btn w-[6rem]" :disabled="stockInItems.length <= 0" tabindex="-1">{{ $t("button.save") }}</button>
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
import { saleOffProductStore } from '@/store/saleOffProduct';
import { stockInStore } from '@/store/stockIn';
import { helper } from '@/helper'
import { computed } from 'vue';

const title = 'Chỉnh sửa đơn nhập'
const { show, data } = defineProps(['show', 'data'])
const emit = defineEmits(['close', 'save'])

const payloadInit = {
    StockInCode: null,
    StockInDate: null,
    StockInNote: null,
}
const itemInit = {
    ProductCode: null,
    LargeUnitQty: 0,
    SmallUnitQty: 0,
    Price: 0,
    PriceQty: 0,
    StockInItemNote: null,
}
const payload = ref({...payloadInit})

const stockInItems = ref([])
const products = computed(() => saleOffProductStore.products)
const confirm = ref(null)
const reload = ref(false)
const file = ref(null)
const price_total = ref(null)

const onClose = () => {
    emit('close', reload.value)
}

const getLargeUnit = (ProductCode) => {
    let product = stockInStore.getProduct(ProductCode)
    if(product) {
        return product.LargeUnit
    }
    return ''
}

const getSmallUnit = (ProductCode) => {
    let product = stockInStore.getProduct(ProductCode)
    if(product) {
        return product.SmallUnit
    }
    return ''
}

const smallUnitDisable = (ProductCode) => {
    let product = stockInStore.getProduct(ProductCode)
    if(!product || !product.SmallUnit) {
        return true
    }
    return false
}

const changeProduct = (item) => {
    let product = stockInStore.getProduct(item.ProductCode)
    if(!product || !product.SmallUnit) {
        item.SmallUnitQty = 0
    }
    if(product) {
        item.Price = product.Price
        item.PriceLabel = helper.format_number(item.Price)

        item.PriceQty = helper.unitQtyTransfer(item.LargeUnitQty, item.SmallUnitQty, product) * item.Price
        item.PriceQtyLabel = helper.format_number(item.PriceQty)
    } else {
        item.Price = 0
        item.PriceLabel = helper.format_number(item.Price)

        item.PriceQty = 0
        item.PriceQtyLabel = helper.format_number(item.PriceQty)
    }
}

const PriceQtyTotal = () => {
    let errors = []
    const total = stockInItems.value.reduce((sum, item, index) => {
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
    stockInItems.value.push({...itemInit})
}

const deleteItem = (index) => {
    stockInItems.value = stockInItems.value.filter((item, i) => i != index)
}

const reset = () => {
    stockInItems.value = []
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
        await stockInStore.import(formData).then((res) => {
            if(res && res.code == 200) {
                setItems(res.data)
            }
        })
    }
}

const setItems = (data) => {
    stockInStore.reset(false)
    for(const i in data) {
        let item = {...stockInStore.itemInit}

        if(data[i].ProductCode) {
            item.ProductCode = data[i].ProductCode
        }
        
        if(data[i].LargeUnitQty || data[i].LargeUnitQty == 0) {
            item.LargeUnitQty = data[i].LargeUnitQty
        }
        if(data[i].SmallUnitQty || data[i].SmallUnitQty == 0) {
            item.SmallUnitQty = data[i].SmallUnitQty
        }

        stockInStore.setItem(item)
    }
}

/**
 * Lifecycle
 */
onBeforeMount(async () => {
})
onMounted(async () => {
    payload.value = {
        StockInCode: data.StockInCode,
        StockInDate: data.StockInDate,
        StockInNote: data.StockInNote,
    }
    // console.log(saleOffStockInItems)
    stockInItems.value = data.saleOffStockInItems
})

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
        payload.value.items = stockInItems.value
        console.log(payload.value)
        const res = await stockInStore.update(payload.value).then((res) => {
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
            stockInStore.reset()
            emit('save', reload.value)
        }
    }

}

</script>