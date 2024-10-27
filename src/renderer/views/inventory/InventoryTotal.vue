<template>
    <div class="gap-1 wrapper-scroll">
        <form class="flex content-between gap-3" @submit.prevent="submit()">
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
                Số lượng mặt hàng: {{ format_number(report.total) }} | Giá trị kho: {{  format_number(report.totalPrice) }}
            </div>
        </div>

        <div class="parent-scroll">
            <table class="view-scroll t-border">
                <thead>
                    <tr>
                        <th class="w-[6rem]">
                            <th-sort @sort="sort()" :search="search" :field="'ProductCode'">{{ $t("attr.inventory.ProductCode") }}</th-sort>
                        </th>
                        <th class="">
                            <th-sort @sort="sort()" :search="search" :field="'ProductName'">{{ $t("attr.inventory.ProductName") }}</th-sort>
                        </th>
                        <th class="w-[7rem]">
                            <th-sort @sort="sort()" :search="search" :field="'LargeUnitQty'">{{ $t("attr.inventory.LargeUnitQty") }}</th-sort>
                        </th>
                        <th class="w-[7rem]">
                            <th-sort @sort="sort()" :search="search" :field="'SmallUnitQty'">{{ $t("attr.inventory.SmallUnitQty") }}</th-sort>
                        </th>
                        <th class="w-[7rem]">
                            <th-sort @sort="sort()" :search="search" :field="'Qty'">{{ $t("attr.inventory.Qty") }}</th-sort>
                        </th>
                        <th class="w-[7rem]">
                            <th-sort @sort="sort()" :search="search" :field="'Price'">{{ $t("attr.inventory.Price") }}</th-sort>
                        </th>
                        <th class="w-[8rem]">
                            <th-sort @sort="sort()" :search="search" :field="'QtyPrice'">{{ $t("attr.inventory.QtyPrice") }}</th-sort>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="item in inventories.items">
                        <td class="text-center">{{ item.ProductCode }}</td>
                        <td class="text-left">{{ item.product.ProductNameLabel }}</td>
                        <td class="text-center">{{ `${item.LargeUnitQty} ${item.product?.LargeUnit}` }}</td>
                        <td class="text-center">{{ item.product?.SmallUnit ? `${item.SmallUnitQty} ${item.product?.SmallUnit}` : '' }}</td>
                        <td class="text-center">{{ item.Qty }}</td>
                        <td class="text-right">{{ format_number(item.Price) }}</td>
                        <td class="text-right">{{ format_number(item.QtyPrice) }}</td>
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
const search = computed(() => inventoryStore.totalSearch)
const inventories = ref({})
const report = ref({})

const clear = async () => {
    inventoryStore.resetTotalSearch()
    await index()
    console.log(search.value)
}

const submit = async () => {
    inventoryStore.setTotalSearch()
    index()
}
const index = async () => {
    await inventoryStore.total(search.value).then((res) => {
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

const totalPrice = async () => {
    await inventoryStore.totalPrice().then((res) => {
        if(res && res.code == 200) {
            report.value = res.data
            // console.log(res.data)
        }
    })
}

onBeforeMount(async () => {
    await index()
    await totalPrice()
})
</script>