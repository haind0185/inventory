<template>
    <div class="gap-1 wrapper-scroll">
        <form class="flex content-between gap-3" @submit.prevent="submit()">
            <div class="flex flex-col flex-1">
                <div class="flex w-full gap-3">
                    <fieldset class="form-input w-[70%]">
                        <legend>{{ $t("attr.inventory.ProductName") }}</legend>
                        <template v-if="products.length > 0">
                            <select2 class="form-control" required :options="products" v-model="search.ProductCode" label="ProductNameLabel" :reduce="item => item.ProductCode">
                                <template #search="{attributes, events}">
                                    <input class="vs__search" :required="!search.ProductCode" v-bind="attributes" v-on="events" />
                                </template>
                            </select2>
                        </template>
                    </fieldset>
                </div>
                <div>
                    <fieldset class="form-input w-[50%]">
                        <legend>{{ $t("attr.entry.EntryDate") }}</legend>
                        <div class="flex gap-3">
                            <date class="w-full from-control" v-model="search.TypeDateFrom" :max-date="search.TypeDateTo"></date>
                            ~
                            <date class="w-full from-control" v-model="search.TypeDateTo" :min-date="search.TypeDateFrom"></date>
                        </div>
                    </fieldset>
                </div>
            </div>
            <div class="flex items-end gap-3">
                <button type="submit" class="btn w-[6rem]">{{ $t("button.search") }}</button>
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
                            Mã SP
                        </th>
                        <th>
                            Mã Đơn
                        </th>
                        <th>
                            Ngày xử lý
                        </th>
                        <th>
                            Đơn giá
                        </th>
                        <th>
                            S.L(Đv1)
                        </th>
                        <th>
                            S.L(Đv2)
                        </th>
                        <th>
                            Tổng S.L
                        </th>
                        <th>
                            Thành tiền
                        </th>
                        <th>
                            S.L(Kho)
                        </th>
                        <th>
                            Thành tiền(Kho)
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="item in data.items" :class="{'exit': !item.Type}">
                        <td class="text-center">{{ item.ProductCode }}</td>
                        <td class="text-left">{{ item.Code }}</td>
                        <td class="text-center">{{ item.TypeDate }}</td>
                        <td class="text-right">{{ format_number(item.Price) }}</td>
                        <td class="text-right">{{ format_number(item.LargeUnitQty) }}</td>
                        <td class="text-right">{{ format_number(item.SmallUnitQty) }}</td>
                        <td class="text-right">{{ format_number(item.Qty) }}</td>
                        <td class="text-right">{{ format_number(item.QtyPrice) }}</td>
                        <td class="text-right">{{ format_number(item.SumQty) }}</td>
                        <td class="text-right">{{ format_number(item.SumQtyPrice) }}</td>
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

const search = computed(() => inventoryStore.productSearch)
const products = computed(() => entryStore.products)
const data = ref({})

const submit = async () => {
    inventoryStore.setProductSearch()
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

const index = async () => {
    await inventoryStore.product(search.value).then((res) => {
        if(res && res.code == 200) {
            data.value = res.data
        }
    })
}

const sort = async () => {
    if (products.value.total > 0) {
        inventoryStore.setAttrProductSearch({page: 1})
        await index()
    }
}

const pagination = (page) => {
    inventoryStore.setAttrProductSearch({page: page})
    index()
}

onMounted(async () => {
    await list()
})
</script>