<template>
    <Modal :show="show" :title="title" maxWidth="max-w-6xl" @close="onClose()" class="">
        <form class="flex flex-col justify-between gap-3 p-2" @submit.prevent="onSave()" style="height: 40rem;" >
            <div class="flex justify-between p-2">
                <div>
                </div>
                <div class="flex justify-end gap-3">
                    <button type="button" class="btn green w-[6rem]" @click="addItem()">{{ $t('button.add_item') }}</button>
                    <input id="file" ref="file" type="file" @change="onFileChange($event)" class="hidden">
                    <button type="button" class="btn silver w-[6rem]" @click="openFile()">{{ $t('button.import') }}</button>
                    <button type="button" class="btn silver w-[6rem]" @click="reset()">{{ $t('button.reset') }}</button>
                </div>
            </div>
            <div class="flex gap-3">
                <div class="w-[3rem] justify-center items-end flex">
                    <div class="w-[1rem]"></div>
                    <span class="w-[2rem] text-end text-sm">
                        {{ products.length ? products.length : '' }}
                    </span>
                </div>
                <fieldset class="w-[10%] form-input required">
                    <legend>{{ "Mã sản phẩm" }}</legend>
                </fieldset>
                <fieldset class="w-[40%] form-input required">
                    <legend>{{ "Tên sản phẩm" }}</legend>
                </fieldset>
                <fieldset class="w-[10%] form-input required">
                    <legend>{{ $t("attr.product.Price") }}</legend>
                </fieldset>
                <fieldset class="w-[10%] form-input required">
                    <legend>{{ $t("attr.product.LargeUnit") }}</legend>
                </fieldset>
                <fieldset class="w-[10%] form-input">
                    <legend>{{ $t("attr.product.SmallUnit") }}</legend>
                </fieldset>
                <fieldset class="w-[10%] form-input required">
                    <legend>{{ $t("attr.product.ConversionRate") }} <br><span class="text-xs text-gray-300">(Đv1 x QC = Đv2)</span></legend>
                </fieldset>
            </div>
            <div class="flex-1" style="overflow: auto; border-top: 1px solid gray; border-bottom: 1px solid gray;">
                <div class="flex-col gap-1 p-1 d-flex">
                    
                    <template v-for="(product, index) in products">
                        <div class="flex gap-3">
                            <div class="flex items-center text-sm w-[3rem] gap-1" style="margin-bottom: -3px;">
                                <div class="w-[1rem]">
                                    <span class="close-item" @click="deleteItem(index)" v-if="products.length > 1">✕</span>
                                </div>
                                <span class="w-[2rem] text-end">
                                    {{ index+1  }}
                                </span>
                            </div>
                            <fieldset class="w-[10%] form-input required">
                                <input type="text" class="w-full text-center form-control" required v-model="product.ProductCode">
                            </fieldset>
                            <fieldset class="w-[40%] form-input required">
                                <input type="text" class="w-full form-control" required v-model="product.ProductName" style="font-size: 12px;">
                            </fieldset>
                            <fieldset class="w-[10%] form-input required">
                                <input type="number" class="w-full text-right form-control" required v-model="product.Price" min="0">
                            </fieldset>
                            <fieldset class="w-[10%] form-input required">
                                <select2 class="form-control" required :options="optionsList" v-model="product.LargeUnit">
                                    <template #search="{attributes, events}">
                                        <input class="vs__search" :required="product.LargeUnit == null || product.LargeUnit == ''" v-bind="attributes" v-on="events" />
                                    </template>
                                </select2>
                            </fieldset>
                            <fieldset class="w-[10%] form-input">
                                <select2 class="form-control" :options="optionsList" v-model="product.SmallUnit" :clearable="true" :option:selected="changeSmallUnit(product)"></select2>
                            </fieldset>
                            <fieldset class="w-[10%] form-input" :class="{'required': product.SmallUnit}">
                                <input type="number" class="w-full text-center form-control" min="1" :required="product.SmallUnit" :disabled="!product.SmallUnit" v-model="product.ConversionRate">
                            </fieldset>
                        </div>
                    </template>
                </div>
            </div>

            <div class="flex items-center justify-around w-full" style="height: 3rem;">
                <button type="button" class="btn silver w-[6rem]" @click="onClose()">{{ $t("button.cancel") }}</button>
                <button type="submit" class="btn w-[6rem]" :disabled="products.length <= 0">{{ $t("button.save") }}</button>
            </div>
        </form>
    </Modal>
    <Confirm ref="confirm"></Confirm>
</template>

<script setup>
import { onMounted, ref, watch, computed } from 'vue'
import { t } from '@/i18n'
import { saleOffProductStore } from '@/store/saleOffProduct';
import { UNIT } from '@/constant';

const props = defineProps(['show'])
const emit = defineEmits(['close', 'save'])
const title = "Thêm nhiều sản phẩm"

const confirm = ref(null)
const reload = ref(false)
const optionsList = ref(UNIT)
const file = ref(null)
const products = computed(() => saleOffProductStore.products)

const onClose = () => {
    emit('close', reload.value)
}

const changeSmallUnit = (product) => {
    if(!product.SmallUnit) {
        console.log(product)
        product.ConversionRate = null
    }
}

const addItem = () => {
    saleOffProductStore.add()
}

const deleteItem = (index) => {
    saleOffProductStore.delete(index)
}

const openFile = () => {
    file.value.value = null
    file.value.click()
}

const setProducts = (data) => {
    saleOffProductStore.reset()
    for(const i in data) {
        let product = {...saleOffProductStore.init}

        if(data[i].ProductCode) {
            product.ProductCode = data[i].ProductCode
        }
        if(data[i].ProductName) {
            product.ProductName = data[i].ProductName
        }
        if(data[i].Expire || data[i].Expire == 0) {
            product.Expire = data[i].Expire
        }
        if(data[i].Price || data[i].Price == 0) {
            product.Price = data[i].Price
        }
        if(data[i].ConversionRate) {
            product.ConversionRate = data[i].ConversionRate
        }
        saleOffProductStore.setProduct(product)
    }
    // console.log(products)
}

const onFileChange = async (e) => {
    let file = e.target.files ? e.target.files[0] : null
    if(file) {
        let formData = new FormData();
        formData.append('file', file);
        await saleOffProductStore.import(formData).then((res) => {
            if(res && res.code == 200) {
                setProducts(res.data)
            }
        })
    }
}

const reset = () => {
    saleOffProductStore.reset()
}

const onSave = async () => {
    // console.log(products.value)
    const res = await saleOffProductStore.bulkCreate({products: products.value}).then((res) => {
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
        saleOffProductStore.reset()
        emit('save', reload.value)
    }
}

</script>