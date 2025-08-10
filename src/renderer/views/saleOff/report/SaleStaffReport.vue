<template>
    <div class="gap-1 wrapper-scroll">
        <form class="flex content-between gap-3" @submit.prevent="index()">
            <div class="flex flex-col flex-1">
                <div class="flex w-full gap-3">
                    <fieldset class="form-input w-[50%]">
                        <legend>Nhân viên bán hàng</legend>
                        <select2 class="w-full form-control"
                            :multiple="true"
                            :clearable="true"    
                            :options="master.saleStaffs"
                            v-model="saleStaffSearch.Ids"
                            label="SaleStaffName"
                            id="multiple-custom"
                            :reduce="item => item.id">
                            <template #search="{ attributes, events }">
                                <input
                                v-bind="attributes"
                                v-on="events"
                                class="vs__search"
                                data-extra="multiple-customer"
                                />
                            </template>
                        </select2>
                    </fieldset>
    
                    <fieldset class="form-input w-[30%]">
                        <legend>Ngày tạo đơn</legend>
                        <div class="flex gap-3">
                            <date class="w-full from-control" v-model="saleStaffSearch.OrderDateFrom" :max-date="saleStaffSearch.OrderDateTo"></date>
                            ~
                            <date class="w-full from-control" v-model="saleStaffSearch.OrderDateTo" :min-date="saleStaffSearch.OrderDateFrom"></date>
                        </div>
                    </fieldset>
                </div>
            </div>
            <div class="flex items-end gap-3">
                <button type="submit" class="btn w-[6rem]" tabindex="-1">{{ $t("button.search") }}</button>
                <button type="button" class="btn silver w-[6rem]" @click="clear()" tabindex="-1">{{ $t("button.clear") }}</button>
            </div>
        </form>

        <div class="flex mt-5">
            <div class="w-[40%] flex">
                <Pagination v-if="customers.total" v-model="saleStaffSearch.page" class="mb-0" :page-count="customers.page_count ?? 0" :click-handler="pagination"></Pagination>
                
            </div>
            <div class="flex justify-center w-[20%] items-center">
                <span v-if="customers.total">
                    {{ format_number(customers.firstItem) }}-{{ format_number(customers.lastItem) }}/{{  format_number(customers.total) }}
                </span>
            </div>
            <div class="flex justify-end w-[40%] gap-3">
                <button type="button" class="btn w-[6rem]" @click="exportFile()">{{ $t("button.export") }}</button>
            </div>
        </div>

        <div class="parent-scroll">
            <table class="view-scroll t-border">
                <thead>
                    <tr>
                        <th class="w-[10rem]">NVBH</th>
                        <th class="w-[4rem]">Tháng</th>
                        <th class="w-[6rem]">Đơn</th>
                        <th class="">Sản phẩm</th>
                        <th class="w-[3rem]">S.L.1</th>
                        <th class="w-[3rem]">S.L.2</th>
                        <th class="w-[4rem]">Đơn giá</th>
                        <th class="w-[3rem]">S.L</th>
                        <th class="w-[5rem]">Thành tiền</th>
                        <th class="w-[12rem]">Ghi chú</th>
                    </tr>
                </thead>
                <tbody>
                    <template v-for="(customer, customerCount) in customers.items">
                        <template v-for="(month, mountCount) in customer.Months">
                            <template v-for="(order, orderCount) in month.Orders">
                                <template v-for="(product, productCount) in order.Products">
                                    <tr>
                                        <td :rowspan="countNestedItems(customer, ['Months', 'Orders', 'Products'])" v-if="mountCount == 0 && orderCount == 0 && productCount == 0">
                                            {{ `${customer.SaleStaffName}` }}<br>
                                            <span class="font-bold">
                                                {{ format_number(customer.Months.reduce((sum, item) => sum + item.Orders.reduce((sum, item) => sum + item.Products.reduce((sum, item) => sum + item.PriceQty, 0), 0), 0)) }}
                                            </span>
                                        </td>
                                        <td class="text-center row-left" :rowspan="countNestedItems(month, ['Orders', 'Products'])" v-if="orderCount == 0 && productCount == 0">
                                            {{ month.Name }}<br>
                                            <span class="font-bold">
                                                {{ format_number(month.Orders.reduce((sum, item) => sum + item.Products.reduce((sum, item) => sum + item.PriceQty, 0), 0)) }}
                                            </span>
                                        </td>
                                        <td class="text-center row-left" :rowspan="countNestedItems(order, ['Products'])" v-if="productCount == 0">
                                            {{ order.OrderCode }}<br>
                                            {{ order.OrderDate }}<br>
                                            <span class="font-bold">
                                                {{ format_number(order.Products.reduce((sum, item) => sum + item.PriceQty, 0)) }}
                                            </span>
                                        </td>
                                        <td class="row-left">{{ product.ProductNameLabel }}</td>
                                        <td class="text-right">{{ format_number(product.LargeUnitQty) }}</td>
                                        <td class="text-right">{{ format_number(product.SmallUnitQty) }}</td>
                                        <td class="text-right">{{ format_number(product.Price) }}</td>
                                        <td class="text-right">{{ format_number(product.Qty) }}</td>
                                        <td class="text-right">{{ format_number(product.PriceQty) }}</td>
                                        <td>{{ product.OrderItemNote }}</td>
                                    </tr>
                                </template>
                            </template>
                        </template>
                    </template>
                </tbody>
            </table>
        </div>

        <Confirm ref="confirm"></Confirm>
    </div>
</template>

<script setup>
import { onMounted, onBeforeMount, computed, watch, ref } from 'vue'
import moment from 'moment'
import { SOReport } from '@/store/saleOffReport'
import { store } from '@/store'
import { t } from '@/i18n'
import { helper } from '@/helper'

const saleStaffSearch = computed(() => SOReport.searchSaleStaff)
const customers = ref({})
const confirm = ref(null)
const master = computed({
    get() {
        return store.master
    },
    set(value) {
        store.master = value
    },
})

const countNestedItems = (obj, path) => {
    if (!obj || !Array.isArray(path) || path.length === 0) return 0

    let nodes = [obj]

    for (const key of path) {
        nodes = nodes.flatMap(item => {
            const next = item[key]
            return Array.isArray(next) ? next : []
        });
    }

    return nodes.length
}


const clear = async () => {
    SOReport.resetSearchSaleStaff()
    await index()
}
const index = async () => {
    await SOReport.saleStaff(saleStaffSearch.value).then((res) => {
        if(res && res.code == 200) {
            setData(res.data)
        }
    })
}

const setData = (data) => {
    customers.value =  data
    customers.value.items = helper.sortCustomersByOrderDate(customers.value.items)
}

const pagination = (page) => {
    saleStaffSearch.value.page = page
    index()
}

const exportFile = async () => {
    await SOReport.exportSaleStaff(saleStaffSearch.value).then((res) => {
        if(res && res.code == 200) {
            console.log(res)
        }
    })
}

onBeforeMount(async () => {
    await store.getMaster()
})
onMounted(async () => {
    await index()
})
</script>