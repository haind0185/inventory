<template>
    <div class="gap-1 wrapper-scroll">
        <form class="flex justify-between gap-3" @submit.prevent="submit()">
            <div class="flex flex-col w-[60%] gap-1">
                <div class="flex w-full gap-3">
                    <fieldset class="form-input w-[100%]">
                        <legend>{{ $t("attr.inventory.ProductName") }}</legend>
                        <template v-if="products.length > 0">
                            <select2 class="form-control" required :options="products" v-model="search.ProductCode" label="ProductNameLabel" :reduce="item => item.ProductCode">
                            </select2>
                        </template>
                    </fieldset>
                </div>
                <div class="flex w-full gap-3">
                    <fieldset class="form-input w-[40%]">
                        <legend>{{ $t("attr.entry.EntryCode") }}</legend>
                        <input type="text" class="w-full form-control" v-model="search.EntryCode">
                    </fieldset>
    
                    <fieldset class="form-input w-[60%]">
                        <legend>{{ $t("attr.entry.EntryDate") }}</legend>
                        <div class="flex gap-3">
                            <date class="w-full from-control" v-model="search.EntryDateFrom" :max-date="search.EntryDateTo"></date>
                            ~
                            <date class="w-full from-control" v-model="search.EntryDateTo" :min-date="search.EntryDateFrom"></date>
                        </div>
                    </fieldset>
                </div>
            </div>
            <div class="flex flex-col justify-end gap-1 w-[6rem]">
                <button type="submit" class="btn w-[6rem]">{{ $t("button.search") }}</button>
                <button type="button" class="btn silver w-[6rem]" @click="clear()">{{ $t("button.clear") }}</button>
            </div>
        </form>

        <div class="flex mt-5">
            <div class="w-[40%] flex">
                <Pagination v-if="entries.total" v-model="search.page" class="mb-0" :page-count="entries.page_count ?? 0" :click-handler="pagination"></Pagination>
                
            </div>
            <div class="flex justify-center w-[20%] items-center">
                <span v-if="entries.total">
                    {{ format_number(entries.firstItem) }}-{{ format_number(entries.lastItem) }}/{{  format_number(entries.total) }}
                </span>
            </div>
            <div class="flex justify-end w-[40%] gap-3">
            </div>
        </div>

        <div class="parent-scroll">
            <table class="view-scroll t-border">
                <thead>
                    <tr>
                        <th class="">{{ 'SL' }}</th>
                        <th class="">{{ $t("attr.entry.EntryDate") }}</th>
                        <th class="">{{ $t("attr.entry.EntryCode") }}</th>
                        <th class="">{{ $t("attr.entry.ExpiryDate") }}</th>

                        <th class="">{{ $t("attr.entry.LargeUnitQty") }}</th>
                        <th class="">{{ $t("attr.entry.SmallUnitQty") }}</th>
                        <th class="">{{ $t("attr.entry.Price") }}</th>
                        <th class="">{{ $t("attr.entry.Qty") }}</th>
                        <th class="">{{ $t("attr.entry.PriceQty") }}</th>
                        <th class="">{{ $t("attr.entry.Note") }}</th>
                    </tr>
                </thead>
                <tbody>
                    <template v-for="item in entries.items">
                        <tr style="background: #dfe6f5; cursor: pointer;" @click="item.show = !item.show">
                            <td class="w-[2.5rem] text-center show-list">{{ item.products.length }}</td>
                            <td colspan="9" class="text-left">
                                [{{ item.show ? '-' : '+' }}] {{ item.ProductNameLabel }}
                            </td>
                        </tr>
                        <tr v-for="(entry, index) in item.products" v-show="item.show">
                            <td class="text-center">{{ index+1 }}</td>
                            <td class="text-center">{{ entry.EntryDate }}</td>
                            <td class="text-center">{{ entry.EntryCode }}</td>
                            <td class="text-center">{{ entry.ExpiryDate }}</td>
                            <td class="text-right">{{ format_number(entry.LargeUnitQty) }}</td>
                            <td class="text-right">{{ format_number(entry.SmallUnitQty) }}</td>
                            <td class="text-right">{{ format_number(entry.Price) }}</td>
                            <td class="text-right">{{ format_number(entry.Qty) }}</td>
                            <td class="text-right">{{ format_number(entry.PriceQty) }}</td>
                            <td class="text-left">{{ entry.Note }}</td>
                        </tr>
                        <tr v-show="item.show">
                            <td colspan="4" class="!font-bold text-right">Tổng cộng: </td>
                            <td class="!font-bold text-right">
                                {{ format_number(item.products.reduce((sum, item) => sum + item.LargeUnitQty, 0)) }}
                            </td>
                            <td class="!font-bold text-right">
                                {{ format_number(item.products.reduce((sum, item) => sum + item.SmallUnitQty, 0)) }}
                            </td>
                            <td></td>
                            <td class="!font-bold text-right">
                                {{ format_number(item.products.reduce((sum, item) => sum + item.Qty, 0)) }}
                            </td>
                            <td class="!font-bold text-right">
                                {{ format_number(item.products.reduce((sum, item) => sum + item.PriceQty, 0)) }}
                            </td>
                            <td></td>
                        </tr>
                    </template>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script setup>
import { onMounted, onBeforeMount, computed, watch, ref } from 'vue'
import { entryStore } from '@/store/entry';
import { productStore } from '@/store/product';

const search = computed(() => entryStore.productSearch)
const products = computed(() => entryStore.products)
const entries = ref({})

const submit = async () => {
    entryStore.setProductSearch()
    await index()
}

const index = async () => {
    await entryStore.product(search.value).then((res) => {
        if(res && res.code == 200) {
            setData(res.data)
        }
    })
}

const setData = (data) => {
    entries.value = data
    entries.value.items.map(item => {
        item.show = false
        return item
    })
}

const clear = async () => {
    entryStore.resetProductSearch()
    await index()
}

const sort = async () => {
    if (entries.value.total > 0) {
        search.value.page = 1
        await index()
    }
}

const pagination = (page) => {
    search.value.page = page
    index()
}

const list = async () => {
    await productStore.list().then((res) => {
        if(res && res.code == 200) {
            entryStore.setProducts(res.data.items)
            return true
        }
    })
}

onMounted(async () => {
    await list()
    await index()
})
</script>