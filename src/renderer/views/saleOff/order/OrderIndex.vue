<template>
    <div class="gap-1 wrapper-scroll">
        <form class="flex content-between gap-3" @submit.prevent="index()">
            <div class="flex flex-col flex-1">
                <div class="flex w-full gap-3">
                    <fieldset class="form-input w-[30%]">
                        <legend>{{ 'Mã xuất đơn' }}</legend>
                        <input type="text" class="w-full form-control" v-model="search.OrderCode">
                    </fieldset>
    
                    <fieldset class="form-input w-[40%]">
                        <legend>{{ 'Ngày xuất đơn' }}</legend>
                        <div class="flex gap-3">
                            <date class="w-full from-control" v-model="search.OrderDateFrom" :max-date="search.OrderDateTo"></date>
                            ~
                            <date class="w-full from-control" v-model="search.OrderDateTo" :min-date="search.OrderDateFrom"></date>
                        </div>
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
                <Pagination v-if="orders.total" v-model="search.page" class="mb-0" :page-count="orders.page_count ?? 0" :click-handler="pagination"></Pagination>
                
            </div>
            <div class="flex justify-center w-[20%] items-center">
                <span v-if="orders.total">
                    {{ format_number(orders.firstItem) }}-{{ format_number(orders.lastItem) }}/{{  format_number(orders.total) }}
                </span>
            </div>
            <div class="flex justify-end w-[40%] gap-3">
                <button type="button" class="btn green" @click="onShowAdd()">{{ "+Tạo đơn hàng" }}</button>
            </div>
        </div>

        <div class="parent-scroll">
            <table class="view-scroll t-border">
                <thead>
                    <tr>
                        <th class="text-center w-[1.5rem]">T'</th>
                        <th class="text-center w-[7rem]">NVGN</th>
                        <th class="text-center w-[7rem]">NVBH</th>
                        <th class="text-center w-[7rem]">Khách hàng</th>
                        <th class="text-center">Sản phẩm</th>
                        <th class="text-center">S.L.1</th>
                        <th class="text-center">S.L.2</th>
                        <th class="text-center">T.S.L</th>
                        <th class="text-center">Đơn giá</th>
                        <th class="text-center">Thành tiền</th>
                        <th class="text-center">Ghi chú</th>
                    </tr>
                </thead>
                <tbody>
                    <template v-for="(order, orderCount) in orders.items">
                        <tr style="background: #dfe6f5; cursor: pointer;" @click="order.show = !order.show">
                            <td class="text-center">[{{ order.show ? '-' : '+' }}]</td>
                            <td colspan="8">[{{ order.OrderCode }}] [{{ displayDate(order.OrderDate) }}]</td>
                            <td class="text-right !font-bold">{{ format_number(order.PriceQty) }}</td>
                            <td>{{ order.OrderNote }}</td>
                        </tr>

                        <template v-for="(saleRoute, saleRoutesCount) in order.saleRoutes">
                            <template v-for="(saleStaff, saleStaffCount) in saleRoute.SaleStaffs">
                                <template v-for="(customer, customerCount) in saleStaff.Customers">
                                    <template v-for="(product, productCount) in customer.Products">
                                        <tr v-show="order.show">
                                            <td class="text-center" v-if="saleStaffCount == 0 && customerCount == 0 && productCount == 0" :rowspan="countNestedItems(saleRoute, ['SaleStaffs', 'Customers', 'Products'])">{{ saleRoutesCount+1 }}</td>
                                            
                                            <!-- DeliveryStaff -->
                                            <td class="text-center " v-if="saleStaffCount == 0 && customerCount == 0 && productCount == 0" :rowspan="countNestedItems(saleRoute, ['SaleStaffs', 'Customers', 'Products'])">
                                                <template v-for="(deliveryStaff, deliveryStaffCount) in saleRoute.DeliveryStaffs">
                                                    {{ (deliveryStaffCount != 0 ? ', ' : '')+`${deliveryStaff.DeliveryStaffName}` }}
                                                </template>
                                                <br>
                                                <span class="font-bold">{{ format_number(saleRoute.PriceQty) }}</span>
                                                <br>
                                                <span class="">{{ saleRoute.RouteNote ? `(${saleRoute.RouteNote})` : '' }}</span>
                                            </td>
                                            
                                            <!-- SaleStaff -->
                                            <td class="text-center row-left" v-if="customerCount == 0 && productCount == 0" :rowspan="countNestedItems(saleStaff, ['Customers', 'Products'])">
                                                {{ saleStaff.SaleStaffName }}
                                                <br>
                                                <span class="font-bold">{{ format_number(saleStaff.Customers.reduce((sum, item) => sum + item.Products.reduce((sum, item) => sum + item.PriceQty, 0), 0)) }}</span>
                                            </td>
        
                                            <!-- Customer -->
                                            <td class="text-center row-left" v-if="productCount == 0" :rowspan="countNestedItems(customer, ['Products'])">
                                                {{ customer.CustomerNameLabel }}
                                                <br>
                                                <span class="font-bold">{{ format_number(customer.Products.reduce((sum, item) => sum + item.PriceQty, 0)) }}</span>
                                            </td>

                                            <!-- Product -->
                                            <td class="header-icon" :class="{'row-left': productCount > 0}">
                                                {{ product.ProductNameLabel }}
                                            </td>

                                            <td class="text-right">{{ format_number(product.LargeUnitQty) }}</td>
                                            <td class="text-right">{{ format_number(product.SmallUnitQty) }}</td>
                                            <td class="text-right">{{ format_number(product.Qty) }}</td>
                                            <td class="text-right">{{ format_number(product.Price) }}</td>
                                            <td class="text-right">{{ format_number(product.PriceQty) }}</td>
                                            <td class="">{{ product.OrderItemNote }}</td>
                                        </tr>
                                    </template>
                                </template>
                            </template>
                        </template>
                    </template>
                </tbody>
            </table>
        </div>

        <OrderAddModal
            v-if="showAdd"
            :show="showAdd"
            @close="onCloseAdd($event)"
            @save="onSaveAdd($event)" />
    </div>
</template>

<script setup>
import { onMounted, onBeforeMount, computed, watch, ref } from 'vue'
import { orderStore } from '@/store/order';
import { store } from '@/store';
import { inventoryStore } from '@/store/inventory';
import OrderAddModal from './OrderAddModal.vue';

const showAdd = ref(false)
const search = computed(() => orderStore.search)
const orders = ref({})
const master = ref()

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
const onShowAdd = async () => {
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
    orderStore.resetSearch()
    await index()
}
const index = async () => {
    await orderStore.index(search.value).then((res) => {
        if(res && res.code == 200) {
            setData(res.data)
        }
    })
}

const setData = (data) => {
    orders.value = data
    orders.value.items.map(order => {
        let SaleOffRoutes = []
        
        order.saleOffRoutes.forEach(route => {
            let SaleRoute = SaleOffRoutes.find(c => c.id === route.id);
            if(!SaleRoute) {
                SaleRoute = {
                    DeliveryStaffs: [],
                    SaleStaffs: [],
                    id: parseInt(route.id),
                    PriceQty: route.PriceQty
                }
                SaleOffRoutes.push(SaleRoute)
            }
            let saleRouteIndex = SaleOffRoutes.findIndex(c => c.id === SaleRoute.id)

            SaleOffRoutes[saleRouteIndex].RouteNote = route.RouteNote
            
            if(route.DeliveryStaffId1) {
                SaleOffRoutes[saleRouteIndex].DeliveryStaffs.push(route.deliveryStaff1)
            }
            if(route.DeliveryStaffId2) {
                SaleOffRoutes[saleRouteIndex].DeliveryStaffs.push(route.deliveryStaff2)
            }
            if(route.DeliveryStaffId3) {
                SaleOffRoutes[saleRouteIndex].DeliveryStaffs.push(route.deliveryStaff3)
            }
            
            route.saleOffOrderItems.forEach(orderItem => {
                let SaleStaff = SaleOffRoutes[saleRouteIndex].SaleStaffs.find(c => c.id === orderItem.SaleStaffId)
                if(!SaleStaff) {
                    SaleStaff = orderItem.saleStaff
                    SaleStaff.Customers = []
                    
                    SaleOffRoutes[saleRouteIndex].SaleStaffs.push(SaleStaff)
                }
                const staffIndex = SaleOffRoutes[saleRouteIndex].SaleStaffs.findIndex(c => c.id === SaleStaff.id)

                let Customer = SaleStaff.Customers.find(c => c.CustomerCode === orderItem.CustomerCode)
                if(!Customer) {
                    Customer = orderItem.customer
                    Customer.Products = []
                    
                    SaleOffRoutes[saleRouteIndex].SaleStaffs[staffIndex].Customers.push(Customer)
                }
                const customerIndex = SaleOffRoutes[saleRouteIndex].SaleStaffs[staffIndex].Customers.findIndex(c => c.CustomerCode === Customer.CustomerCode)

                let Product = Customer.Products.find(c => c.ProductCode === orderItem.CustomerCode)
                if(!Product) {
                    Product = orderItem.saleOffProduct

                    Product.LargeUnitQty  = orderItem.LargeUnitQty
                    Product.SmallUnitQty  = orderItem.SmallUnitQty
                    Product.OrderItemNote = orderItem.OrderItemNote
                    Product.Qty           = orderItem.Qty
                    Product.PriceQty      = orderItem.PriceQty

                    SaleOffRoutes[saleRouteIndex].SaleStaffs[staffIndex].Customers[customerIndex].Products.push(Product)
                }
            })
        })

        order.saleRoutes = SaleOffRoutes
        order.show = false

        return order
    })
    console.log(orders.value)
}

const sort = async () => {
    if (orders.value.total > 0) {
        search.value.page = 1
        await index()
    }
}

const pagination = (page) => {
    search.value.page = page
    index()
}

onBeforeMount(async () => {
    await store.getMaster()
    master.value = store.findMaster
    await index()
})
onMounted(async () => {
})
</script>