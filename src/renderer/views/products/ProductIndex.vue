<template>
    <div class="gap-1 wrapper-scroll">
        <form class="flex content-between gap-3" @submit.prevent="index()">
            <div class="flex flex-col flex-1">
                <div class="flex w-full gap-3">
                    <fieldset class="form-input w-[30%]">
                        <legend>{{ $t("attr.product.code") }}</legend>
                        <input type="text" class="w-full form-control" v-model="search.code">
                    </fieldset>
    
                    <fieldset class="form-input w-[30%]">
                        <legend>{{ $t("attr.product.name") }}</legend>
                        <input type="text" class="w-full form-control" v-model="search.name">
                    </fieldset>
                </div>
            </div>
            <div class="flex items-end gap-3">
                <button type="submit" class="btn w-[6rem]">{{ $t("button.search") }}</button>
                <button type="button" class="btn silver w-[6rem]" @click="clear()">{{ $t("button.clear") }}</button>
            </div>
        </form>

        <div class="flex mt-5">
            <div class="w-[40%] flex">
                <Pagination v-if="products.total" v-model="search.page" class="mb-0" :page-count="products.page_count ?? 0" :click-handler="pagination"></Pagination>
                
            </div>
            <div class="flex justify-center w-[20%] items-center">
                <span v-if="products.total">
                    <!-- {{ number(products.firstItem) }}-{{ number(products.lastItem) }}/{{ number(products.total) }} -->
                    {{ format_number(products.firstItem) }}-{{ format_number(products.lastItem) }}/{{  format_number(products.total) }}
                </span>
            </div>
            <div class="flex justify-end w-[40%] gap-3">
                <button type="button" class="btn green w-[6rem]" @click="onShowAdd()">{{ $t("button.add") }}</button>
            </div>
        </div>

        <div class="parent-scroll">
            <table class="view-scroll t-border">
                <thead>
                    <tr>
                        <th>
                            <th-sort @sort="sort()" :search="search" :field="'code'">{{ $t("attr.product.code") }}</th-sort>
                        </th>
                        <th>
                            <th-sort @sort="sort()" :search="search" :field="'name'">{{ $t("attr.product.name") }}</th-sort>
                        </th>
                        <th>{{ $t("attr.product.unit1") }}</th>
                        <th>{{ $t("attr.product.unit2") }}</th>
                        <th>{{ $t("attr.product.specific") }}</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="item in products.items">
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
import { number } from 'joi';

const showAdd = ref(false)
const search = computed(() => productStore.search)
const products = ref({})

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

const clear = async () => {
    productStore.resetSearch()
    await index()
    console.log(search.value)
}
const index = async () => {
    await productStore.index(search.value).then((res) => {
        if(res && res.code == 200) {
            products.value = res.data
        }
    })
}

const sort = async () => {
    if (products.value.total > 0) {
        search.value.page = 1
        await index()
    }
}

const pagination = (page) => {
    search.value.page = page
    index()
}

onMounted(async () => {
    await index()
})
</script>