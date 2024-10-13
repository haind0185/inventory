<template>
    <div class="gap-3 wrapper-scroll">
        <form class="flex content-between gap-3" @submit.prevent="index()">
            <div class="flex flex-col flex-1">
                <div class="flex w-full gap-3">
                    <fieldset class="form-input w-[30%]">
                        <legend>{{ $t("attr.product.code") }}</legend>
                        <input type="text" class="w-full form-control">
                    </fieldset>
    
                    <fieldset class="form-input w-[30%]">
                        <legend>{{ $t("attr.product.name") }}</legend>
                        <input type="text" class="w-full form-control">
                    </fieldset>
                </div>
            </div>
            <div class="w-[6rem] flex flex-col gap-3">
                <button type="submit" class="btn w-[6rem]">{{ $t("button.search") }}</button>
                <button type="button" class="btn silver w-[6rem]">{{ $t("button.clear") }}</button>
            </div>
        </form>

        <div class="flex">
            <div class="w-1/3"></div>
            <div class="w-1/3"></div>
            <div class="flex justify-end w-1/3 gap-3">
                <button type="button" class="btn green w-[6rem]" @click="onShowAdd()">{{ $t("button.add") }}</button>
            </div>
        </div>

        <div class="parent-scroll">
            <table class="view-scroll t-border">
                <thead>
                    <tr>
                        <th>{{ $t("attr.product.code") }}</th>
                        <th>{{ $t("attr.product.name") }}</th>
                        <th>{{ $t("attr.product.unit1") }}</th>
                        <th>{{ $t("attr.product.unit2") }}</th>
                        <th>{{ $t("attr.product.specific") }}</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="item in items">
                        <td class="text-center">{{ item.code }}</td>
                        <td class="text-left">{{ item.name }}</td>
                        <td class="text-center">{{ item.unit1 }}</td>
                        <td class="text-center">{{ item.unit2 }}</td>
                        <td class="text-center">{{ item.specific }}</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <ProductAddModal
            v-if="showAdd"
            :show="showAdd"
            @close="onCloseAdd($event)"
            @save="onSaveAdd($event)" />
    </div>
</template>

<script setup>
import { onMounted, onBeforeMount, computed, watch, ref } from 'vue'
import { productStore } from '@/store/product';
import ProductAddModal from './ProductAddModal.vue'

const showAdd = ref(false)
const items = ref([])

const onShowAdd = () => {
    showAdd.value = true
}
const onCloseAdd = (event) => {
    showAdd.value = false
    if(event) {
        index()
    }
}
const onSaveAdd = (event) => {
    showAdd.value = false
    if(event) {
        index()
    }
}

const index = async () => {
    await productStore.index({}).then((res) => {
        console.log(res)
        if(res && res.code == 200) {
            items.value = res.data
        }
    })
}

onMounted(async () => {
    await index()
})
</script>