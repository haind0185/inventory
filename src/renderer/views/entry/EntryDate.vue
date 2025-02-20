<template>
    <div class="gap-1 wrapper-scroll">
        <form class="flex justify-between gap-3" @submit.prevent="submit()">
            <div class="flex flex-col w-[60%] gap-1">
                <!-- <div class="flex w-full gap-3">
                    <fieldset class="form-input w-[100%]">
                        <legend>{{ $t("attr.inventory.ProductName") }}</legend>
                        <template v-if="products.length > 0">
                            <select2 class="form-control" required :options="products" v-model="search.ProductCode" label="ProductNameLabel" :reduce="item => item.ProductCode">
                            </select2>
                        </template>
                    </fieldset>
                </div> -->
                <div class="flex w-full gap-3">
                    <!-- <fieldset class="form-input w-[40%]">
                        <legend>{{ $t("attr.entry.EntryCode") }}</legend>
                        <input type="text" class="w-full form-control" v-model="search.EntryCode">
                    </fieldset> -->
    
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
                        <th class="" colspan="3">{{ 'SL' }}</th>
                        <th class="">{{ $t("attr.entry.ProductNameLabel") }}</th>
                        <th class="w-[6rem]">{{ $t("attr.entry.ExpiryDate") }}</th>

                        <th class="w-[4rem]">{{ $t("attr.entry.LargeUnitQty") }}</th>
                        <th class="w-[4rem]">{{ $t("attr.entry.SmallUnitQty") }}</th>
                        <th class="w-[5rem]">{{ $t("attr.entry.Price") }}</th>
                        <th class="w-[6rem]">{{ $t("attr.entry.Qty") }}</th>
                        <th class="w-[7rem]">{{ $t("attr.entry.PriceQty") }}</th>
                        <th class="w-[12rem]">{{ $t("attr.entry.Note") }}</th>
                    </tr>
                </thead>
                <tbody>
                    <template v-for="item in entries.items">
                        <tr style="background: #dfe6f5; cursor: pointer;" @click="item.show = !item.show">
                            <td class="text-center show-list w-[2rem]" colspan="3">{{ item.codes.length }}</td>
                            <td colspan="8" class="text-left w-[94%]">
                                [{{ item.show ? '-' : '+' }}] {{ item.EntryDate }}
                            </td>
                        </tr>
                        <template v-for="(code, i) in item.codes">
                            <tr style="background: #c3bfc554; cursor: pointer;" @click="code.show = !code.show" v-if="item.show">
                                <td class="w-[2rem]" v-if="i == 0" :rowspan="item.codes.length + item.codes.filter(item => item.show == true).reduce((sum, item) => {return sum + item.entries.length + 1}, 0)"></td>
                                <td class="text-center show-list row-left" colspan="2">{{ code.entries.length }}</td>
                                <td colspan="8" class="text-left w-[94%]">
                                    [{{ code.show ? '-' : '+' }}] {{ code.EntryCode }}
                                </td>
                            </tr>
                            <tr v-for="(entry, index) in code.entries" v-if="code.show && item.show">
                                <!-- <td class="w-[2.5rem]" v-if="index == 0" :rowspan="code.entries.length"></td> -->
                                <td class="w-[2rem] row-left" v-if="index == 0" :rowspan="code.entries.length + 1"></td>
                                <td class="text-center w-[2rem] row-left">{{ index+1 }}</td>
                                <td class="text-left">{{ entry.ProductNameLabel }}</td>
                                <td class="text-center">{{ entry.ExpiryDate }}</td>
                                <td class="text-right">{{ format_number(entry.LargeUnitQty) }}</td>
                                <td class="text-right">{{ format_number(entry.SmallUnitQty) }}</td>
                                <td class="text-right">{{ format_number(entry.Price) }}</td>
                                <td class="text-right">{{ format_number(entry.Qty) }}</td>
                                <td class="text-right">{{ format_number(entry.PriceQty) }}</td>
                                <td class="text-left">{{ entry.Note }}</td>
                            </tr>
                            <tr v-show="code.show && item.show">
                                <td class="w-[2rem] row-left" :rowspan="1"></td>
                                <td colspan="2" class="!font-bold text-right">Tổng cộng: </td>
                                <td class="!font-bold text-right">
                                    {{ format_number(code.entries.reduce((sum, item) => sum + item.LargeUnitQty, 0)) }}
                                </td>
                                <td class="!font-bold text-right">
                                    {{ format_number(code.entries.reduce((sum, item) => sum + item.SmallUnitQty, 0)) }}
                                </td>
                                <td></td>
                                <td class="!font-bold text-right">
                                    {{ format_number(code.entries.reduce((sum, item) => sum + item.Qty, 0)) }}
                                </td>
                                <td class="!font-bold text-right">
                                    {{ format_number(code.entries.reduce((sum, item) => sum + item.PriceQty, 0)) }}
                                </td>
                                <td></td>
                            </tr>
                        </template>
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

const search = computed(() => entryStore.dateSearch)
const products = computed(() => entryStore.products)
const entries = ref({})

const submit = async () => {
    entryStore.setDateSearch()
    await index()
}

const index = async () => {
    await entryStore.date(search.value).then((res) => {
        if(res && res.code == 200) {
            setData(res.data)
        }
    })
}

const setData = (data) => {
    entries.value = data
    entries.value.items.map(item => {
        item.codes = item.codes.map(i => {
            i.show = false
            return i
        })
        item.show = false
        return item
    })
}

const clear = async () => {
    entryStore.resetDateSearch()
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