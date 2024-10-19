<template>
    <div class="gap-1 wrapper-scroll">
        <form class="flex content-between gap-3" @submit.prevent="index()">
            <div class="flex flex-col flex-1">
                <div class="flex w-full gap-3">
                    <fieldset class="form-input w-[30%]">
                        <legend>{{ $t("attr.product.ProductCode") }}</legend>
                        <input type="text" class="w-full form-control" v-model="search.ProductCode">
                    </fieldset>
    
                    <fieldset class="form-input w-[30%]">
                        <legend>{{ $t("attr.product.ProductName") }}</legend>
                        <input type="text" class="w-full form-control" v-model="search.ProductName">
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
                <Pagination v-if="inventories.total" v-model="search.page" class="mb-0" :page-count="inventories.page_count ?? 0" :click-handler="pagination"></Pagination>
                
            </div>
            <div class="flex justify-center w-[20%] items-center">
                <span v-if="inventories.total">
                    {{ format_number(inventories.firstItem) }}-{{ format_number(inventories.lastItem) }}/{{  format_number(inventories.total) }}
                </span>
            </div>
            <div class="flex justify-end w-[40%] gap-3">
                <!-- <button type="button" class="btn green w-[6rem]" @click="onShowAdd()">{{ $t("button.add") }}</button> -->
            </div>
        </div>

        <div class="parent-scroll">
            <table class="view-scroll t-border">
                <thead>
                    <tr>
                        <th class="w-[9rem]">
                            <th-sort @sort="sort()" :search="search" :field="'ProductCode'">{{ $t("attr.inventory.ProductCode") }}</th-sort>
                        </th>
                        <th class="">
                            <th-sort @sort="sort()" :search="search" :field="'ProductName'">{{ $t("attr.inventory.ProductName") }}</th-sort>
                        </th>
                        <th class="w-[9rem]">
                            <th-sort @sort="sort()" :search="search" :field="'ExpiryDate'">{{ $t("attr.inventory.ExpiryDate") }}</th-sort>
                        </th>
                        <th class="w-[9rem]">
                            <th-sort @sort="sort()" :search="search" :field="'LargeUnitQty'">{{ $t("attr.inventory.LargeUnitQty") }}</th-sort>
                        </th>
                        <th class="w-[9rem]">
                            <th-sort @sort="sort()" :search="search" :field="'SmallUnitQty'">{{ $t("attr.inventory.SmallUnitQty") }}</th-sort>
                        </th>
                        <th class="w-[9rem]">
                            <th-sort @sort="sort()" :search="search" :field="'ExpireCount'">{{ $t("attr.inventory.ExpireCount") }}</th-sort>
                        </th>
                        <th class="w-[12rem]">
                            <th-sort @sort="sort()" :search="search" :field="'ExpirePercent'">{{ $t("attr.inventory.ExpirePercent") }}</th-sort>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="item in inventories.items">
                        <td class="text-center">{{ item.ProductCode }}</td>
                        <td class="text-left">{{ `${item.product.ProductName} [${item.ExpiryDate}] [${item.product.Expire}]` }}</td>
                        <td class="text-center">{{ item.ExpiryDate }}</td>
                        <td class="text-center">{{ `${item.LargeUnitQty} ${item.product?.LargeUnit}` }}</td>
                        <td class="text-center">{{ item.product?.SmallUnit ? `${item.SmallUnitQty} ${item.product?.SmallUnit}` : '' }}</td>
                        <td class="text-center">{{ item.ExpireCount }}</td>
                        <!-- <td class="text-center">{{ item.ExpirePercent }}</td> -->
                        <td class="text-center">
                            <progress-bar :value="item.ExpirePercent"></progress-bar>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script setup>
import { onMounted, onBeforeMount, computed, watch, ref } from 'vue'
import { inventoryStore } from '@/store/inventory';
import ProgressBar from '../component/ProgressBar.vue';

const showAdd = ref(false)
const search = computed(() => inventoryStore.search)
const inventories = ref({})

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
    inventoryStore.resetSearch()
    await index()
    console.log(search.value)
}
const index = async () => {
    await inventoryStore.index(search.value).then((res) => {
        if(res && res.code == 200) {
            inventories.value = res.data
        }
    })
}

const sort = async () => {
    if (inventories.value.total > 0) {
        search.value.page = 1
        await index()
    }
}

const pagination = (page) => {
    search.value.page = page
    index()
}

onBeforeMount(async () => {
    await index()
})
</script>