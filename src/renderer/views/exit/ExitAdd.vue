<template>
    <Modal :show="show" :title="title" maxWidth="max-w-5xl" @close="onClose()" class="">
        <form class="flex flex-col justify-between h-full gap-1 p-2" style="min-height: 500px;" @submit.prevent="onSave()">
            <div class="flex-col gap-1 d-flex">
                <div class="flex gap-3 w-[60%] mx-auto">
                    <fieldset class="w-1/3 form-input required">
                        <legend>{{ $t("attr.exit.ExitCode") }}</legend>
                        <input type="text" class="w-full text-center form-control" required v-model="payload.ExitCode">
                    </fieldset>
                    <fieldset class="w-1/3 form-input required">
                        <legend>{{ $t("attr.exit.ExitDate") }}</legend>
                        <date class="w-full from-control" v-model="payload.ExitDate" required></date>
                    </fieldset>
                    <div class="w-1/3 mt-2">
                        <div class="h-[21px]"></div>
                        <label class="flex items-center gap-1 text-sm">
                            <input type="checkbox" v-model="payload.ExitType" >
                            {{ $t("attr.exit.ExitType") }}
                        </label>
                    </div>
                </div>
                <div class="flex justify-end gap-2">
                    <button type="button" class="btn green" @click="addItem()">{{ t('button.add_item') }}</button>
                </div>
                <div>
                    <div class="flex gap-3 p-1 entry-item">
                        <div class="w-[2rem]">{{ ' ' }}</div>
                        <fieldset class="flex-1 form-input required">
                            <legend>{{ $t("attr.exit.ProductCode") }}</legend>
                        </fieldset>
                        <fieldset class="w-[10rem] form-input">
                            <legend>{{ $t("attr.exit.LargeUnitQty") }}</legend>
                        </fieldset>
                        <fieldset class="w-[10rem] form-input">
                            <legend>{{ $t("attr.exit.SmallUnitQty") }}</legend>
                        </fieldset>
                    </div>
                </div>
                <div class="entry">
                    <template v-for="(exit, index) in exits">
                        <div class="flex w-full gap-3 p-1 entry-item">
                            <div class="flex items-center text-sm w-[2rem] gap-2" style="margin-bottom: -3px;">
                                <span class="close-item" @click="deleteItem(index)" v-if="exits.length > 1">✕</span>
                                {{ index+1  }}
                            </div>
                            <fieldset class="flex-1 form-input required">
                                <select2 class="form-control" required :options="inventories" v-model="exit.ProductCode" label="ProductNameLabelGroup" :reduce="item => item.ProductCode" :option:selected="changeProduct(exit)">
                                    <template #search="{attributes, events}">
                                        <input class="vs__search" :required="exit.ProductCode == null || exit.ProductCode == ''" v-bind="attributes" v-on="events" />
                                    </template>
                                </select2>
                            </fieldset>
                            <fieldset class="w-[10rem] form-input flex items-center">
                                <input type="number" class="w-[7rem] text-center form-control" v-model="exit.LargeUnitQty" min="0">
                                <span class="w-[3rem] text-sm pl-1">{{ getLargeUnit(exit.ProductCode) }}</span>
                            </fieldset>
                            <fieldset class="w-[10rem] form-input flex items-center">
                                <input type="number" class="w-[7rem] text-center form-control" v-model="exit.SmallUnitQty" min="0" :disabled="smallUnitDisable(exit.ProductCode)">
                                <span class="w-[3rem] text-sm pl-1">{{ getSmallUnit(exit.ProductCode) }}</span>
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

const onClose = () => {
    emit('close', reload.value)
}

const addItem = () => {
    exitStore.add()
}

const deleteItem = (index) => {
    exitStore.delete(index)
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
}

onBeforeMount(async () => {
})

/**
 * Call API
 */
const onSave = async () => {
    payload.value.exits = exits.value
    console.log(payload.value)

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

</script>