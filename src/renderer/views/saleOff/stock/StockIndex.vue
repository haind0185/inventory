<template>
    <div class="gap-1 wrapper-scroll">
        <form class="flex content-between gap-3" @submit.prevent="submit()">
            <div class="flex flex-col flex-1">
                <div class="flex w-full gap-3">
                    <fieldset class="form-input w-[30%]">
                        <legend>{{ 'Mã sản phẩm' }}</legend>
                        <input type="text" class="w-full form-control" v-model="search.ProductCode">
                    </fieldset>
    
                    <fieldset class="form-input w-[30%]">
                        <legend>{{ 'Tên sản phẩm' }}</legend>
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
                <Pagination v-if="stocks.total" v-model="search.page" class="mb-0" :page-count="stocks.page_count ?? 0" :click-handler="pagination"></Pagination>
                
            </div>
            <div class="flex justify-center w-[20%] items-center">
                <span v-if="stocks.total">
                    {{ format_number(stocks.firstItem) }}-{{ format_number(stocks.lastItem) }}/{{  format_number(stocks.total) }}
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
                            <th-sort @sort="sort()" :search="search" :field="'ProductCode'">{{ 'Mã sản phẩm' }}</th-sort>
                        </th>
                        <th class="">
                            {{ 'Tên sản phẩm' }}
                        </th>
                        <th class="w-[7rem]">
                            <th-sort @sort="sort()" :search="search" :field="'LargeUnitQty'">{{ 'S.L(1)' }}</th-sort>
                        </th>
                        <th class="w-[7rem]">
                            <th-sort @sort="sort()" :search="search" :field="'SmallUnitQty'">{{ 'S.L(2)' }}</th-sort>
                        </th>
                        <th class="w-[7rem]">
                            <th-sort @sort="sort()" :search="search" :field="'Qty'">{{ 'Tổng S.L' }}</th-sort>
                        </th>
                        <th class="w-[7rem]">
                            <th-sort @sort="sort()" :search="search" :field="'Price'">{{ 'Đơn giá' }}</th-sort>
                        </th>
                        <th class="w-[8rem]">
                            <th-sort @sort="sort()" :search="search" :field="'QtyPrice'">{{ 'Tổng tiền' }}</th-sort>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="item in stocks.items" :class="{'bg-1warning': item.Qty < 0}">
                        <td class="text-center">{{ item.ProductCode }}</td>
                        <td class="text-left">{{ item.ProductName }}</td>
                        <td class="text-center">{{ `${format_number(item.LargeUnitQty)} ${item.saleOffProduct?.LargeUnit}` }}</td>
                        <td class="text-center">{{ item.saleOffProduct?.SmallUnit ? `${format_number(item.SmallUnitQty)} ${item.saleOffProduct?.SmallUnit}` : '' }}</td>
                        <td class="text-center">{{ format_number(item.Qty) }}</td>
                        <td class="text-right">{{ format_number(item.Price) }}</td>
                        <td class="text-right">{{ format_number(item.QtyPrice) }}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>

</template>
<style scoped>
    .bg-1warning {
        background-color: #edc4c4;
    }
</style>

<script setup>
import { onMounted, onBeforeMount, computed, watch, ref } from 'vue'
import { stockStore } from '@/store/stock';

const search = computed(() => stockStore.totalSearch)
const stocks = ref({})
const report = ref({})

const clear = async () => {
    stockStore.resetTotalSearch()
    await index()
    console.log(search.value)
}

const submit = async () => {
    stockStore.setTotalSearch()
    index()
}
const index = async () => {
    await stockStore.total(search.value).then((res) => {
        if(res && res.code == 200) {
            stocks.value = res.data
        }
    })
}

const sort = async () => {
    if (stocks.value.total > 0) {
        search.value.page = 1
        await index()
    }
}

const pagination = (page) => {
    search.value.page = page
    index()
}

const totalPrice = async () => {
    await stockStore.totalPrice().then((res) => {
        if(res && res.code == 200) {
            report.value = res.data
        }
    })
}

onBeforeMount(async () => {
    await index()
    await totalPrice()
})
</script>