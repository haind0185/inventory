<template>
    <div class="gap-1 wrapper-scroll">
        <form class="flex justify-between gap-3" @submit.prevent="submit()">
            <div class="flex flex-col w-[60%] gap-1">
                <div class="flex w-full gap-3">
                    <fieldset class="form-input w-[100%]">
                        <legend>{{ $t("attr.inventory.ProductName") }}</legend>
                        <template v-if="products.length > 0">
                            <select2 class="form-control" :options="products" v-model="search.ProductCode" label="ProductNameLabel" :reduce="item => item.ProductCode">
                            </select2>
                        </template>
                    </fieldset>
                </div>
                <div class="flex w-full gap-3">
                    <fieldset class="form-input w-[40%]">
                        <legend>{{ $t("attr.exit.ExitCode") }}</legend>
                        <input type="text" class="w-full form-control" v-model="search.ExitCode">
                    </fieldset>
    
                    <fieldset class="form-input w-[60%]">
                        <legend>{{ $t("attr.exit.ExitDate") }}</legend>
                        <div class="flex gap-3">
                            <date class="w-full from-control" v-model="search.ExitDateFrom" :max-date="search.ExitDateTo"></date>
                            ~
                            <date class="w-full from-control" v-model="search.ExitDateTo" :min-date="search.ExitDateFrom"></date>
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
                <Pagination v-if="exits.total" v-model="search.page" class="mb-0" :page-count="exits.page_count ?? 0" :click-handler="pagination"></Pagination>
                
            </div>
            <div class="flex justify-center w-[20%] items-center">
                <span v-if="exits.total">
                    {{ format_number(exits.firstItem) }}-{{ format_number(exits.lastItem) }}/{{  format_number(exits.total) }}
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
                        <th class="">{{ $t("attr.exit.ExitDate") }}</th>
                        <th class="">{{ $t("attr.exit.ExitCode") }}</th>

                        <th class="">{{ $t("attr.exit.LargeUnitQty") }}</th>
                        <th class="">{{ $t("attr.exit.SmallUnitQty") }}</th>
                        <th class="">{{ $t("attr.exit.Qty") }}</th>
                        <th class="">{{ $t("attr.exit.Price") }}</th>
                        <th class="">{{ $t("attr.exit.PriceQty") }}</th>
                        <th class="">{{ $t("attr.exit.Note") }}</th>
                    </tr>
                </thead>
                <tbody>
                    <template v-for="item in exits.items">
                        <tr style="background: #dfe6f5; cursor: pointer;" @click="item.show = !item.show">
                            <td class="w-[2.5rem] text-center show-list">{{ item.products.length }}</td>
                            <td colspan="8" class="text-left">
                                [{{ item.show ? '-' : '+' }}] {{ item.ProductNameLabel }}
                            </td>
                        </tr>
                        <tr v-for="(exit, index) in item.products" v-show="item.show">
                            <td class="text-center">{{ index+1 }}</td>
                            <td class="text-center">{{ exit.ExitDate }}</td>
                            <td class="text-center">{{ exit.ExitCode }}</td>
                            <td class="text-right">{{ format_number(exit.LargeUnitQty) }}</td>
                            <td class="text-right">{{ format_number(exit.SmallUnitQty) }}</td>
                            <td class="text-right">{{ format_number(exit.Qty) }}</td>
                            <td class="text-right">{{ format_number(exit.Price) }}</td>
                            <td class="text-right">{{ format_number(exit.PriceQty) }}</td>
                            <td class="text-left">{{ exit.Note }}</td>
                        </tr>
                        <tr v-show="item.show">
                            <td colspan="3" class="!font-bold text-right">Tổng cộng: </td>
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
import { exitStore } from '@/store/exit';
import { productStore } from '@/store/product';

const search = computed(() => exitStore.productSearch)
const products = computed(() => entryStore.products)
const exits = ref({})

const submit = async () => {
    exitStore.setProductSearch()
    await index()
}

const index = async () => {
    await exitStore.product(search.value).then((res) => {
        if(res && res.code == 200) {
            setData(res.data)
        }
    })
}

const setData = (data) => {
    exits.value = data
    exits.value.items.map(item => {
        item.show = false
        return item
    })
}

const clear = async () => {
    exitStore.resetProductSearch()
    await index()
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