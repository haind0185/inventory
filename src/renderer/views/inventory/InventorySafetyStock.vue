<template>
    <div class="gap-1 wrapper-scroll">
        <form class="flex content-between gap-3" @submit.prevent="submit()">
            <div class="flex flex-col flex-1">
                <div class="flex w-full gap-3">
                    <fieldset class="form-input w-[70%]">
                        <legend>{{ $t("attr.inventory.ProductName") }}</legend>
                        <template v-if="products.length > 0">
                            <select2 class="form-control" :options="products" v-model="search.ProductCode" label="ProductNameLabel" :reduce="item => item.ProductCode">
                            </select2>
                        </template>
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
                <Pagination v-if="data.total" v-model="search.page" class="mb-0" :page-count="data.page_count ?? 0" :click-handler="pagination"></Pagination>
                
            </div>
            <div class="flex justify-center w-[20%] items-center">
                <span v-if="data.total">
                    {{ format_number(data.firstItem) }}-{{ format_number(data.lastItem) }}/{{  format_number(data.total) }}
                </span>
            </div>
            <div class="flex justify-end w-[40%] gap-3">
            </div>
        </div>

        <div class="parent-scroll">
            <table class="view-scroll t-border">
                <thead>
                    <tr>
                        <th>
                            Mặt hàng
                        </th>
                        <th>
                            S.L
                        </th>
                        <th>
                            S.L xuất<br>1 ngày
                        </th>
                        <th>
                            Độ lệch<br>mỗi lần xuất
                        </th>
                        <th>
                            Chu kỳ<br>nhập hàng(ngày)
                        </th>
                        <th>
                            Tồn kho<br>an toàn
                        </th>
                        <th>
                            TKAT(đv1)
                        </th>
                        <th>
                            TKAT(đv2)
                        </th>
                        <th class="w-[7rem]">
                            <th-sort @sort="sort()" :search="search" :field="'SafetyQtyRange'">
                                Lệch<br> với kho
                            </th-sort>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="item in data.items">
                        <td class="text-left">{{ `[${item.ProductCode}] ${item.ProductName}`  }}</td>
                        <td class="text-right">{{ format_number(item.Qty) }}</td>
                        <td class="text-right">{{ format_number(item.ExitOneDayQty) }}</td>
                        <td class="text-right">{{ format_number(item.ExitQtyRange) }}</td>
                        <td class="text-right">{{ format_number(item.EntryDayRange) }}</td>
                        <td class="text-right">{{ format_number(item.SafetyQty) }}</td>
                        <td class="text-right">{{ format_number(item.SafetyLargeUnitQty) }}</td>
                        <td class="text-right">{{ format_number(item.SafetySmallUnitQty) }}</td>
                        <td class="text-right">{{ format_number(item.SafetyQtyRange) }}</td>
                    </tr>
                </tbody>
            </table>
        </div>

        
    </div>
</template>

<style>
    .exit {
        background-color: #edc4c4;
    }
</style>

<script setup>
import { onMounted, onBeforeMount, computed, watch, ref } from 'vue'
import { productStore } from '@/store/product';
import { entryStore } from '@/store/entry';
import { inventoryStore } from '@/store/inventory';

const search = computed(() => inventoryStore.safetySearch)
console.log(search.value)
const products = computed(() => entryStore.products)
const data = ref({})

const submit = async () => {
    inventoryStore.setSearch()
    await index()
}

const list = async () => {
    await productStore.list().then((res) => {
        if(res && res.code == 200) {
            entryStore.setProducts(res.data.items)
            return true
        }
    })
}

const clear = async () => {
    inventoryStore.resetSafetySearch()
    await index()
}

const index = async () => {
    await inventoryStore.safety(search.value).then((res) => {
        if(res && res.code == 200) {
            data.value = res.data
        }
    })
}

const sort = async () => {
    if (data.value.total > 0) {
        search.value.page = 1
        await index()
    }
}

const pagination = (page) => {
    inventoryStore.setSafetySearch({page: page})
    index()
}

onMounted(async () => {
    await list()
    await index()
})
</script>