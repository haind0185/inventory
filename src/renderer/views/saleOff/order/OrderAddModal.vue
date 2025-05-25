<template>
    <Modal :show="show" title="Tạo đơn hàng mới" maxWidth="max-w-7xl" @close="onClose()" class="">
        <form class="flex flex-col justify-between h-full gap-1 p-2" style="height: 40rem;" @submit.prevent="onSave()">
            <table class="t-border">
                <thead>
                    <tr>
                        <th v-if="saleRoutes.length > 1"></th>
                        <th class="text-center header-icon">
                            <span class="header-icon-action text" @click="orderStore.routeAdd()">
                                <IconAdd v-tooltip="{ content: 'Thêm một xe', placement: 'top' }"></IconAdd>
                            </span>
                        </th>
                        <th class="text-center">NVGN</th>
                        <th class="text-center">NVBH</th>
                        <th class="text-center">Khách hàng</th>
                        <th class="text-center">Sản phẩm</th>
                        <th class="text-center">S.L.1</th>
                        <th class="text-center">S.L.2</th>
                        <th class="text-center">Đơn giá</th>
                        <th class="text-center">Thành tiền</th>
                        <th class="text-center">Ghi chú</th>
                    </tr>
                </thead>
                <tbody>
                    <template v-for="(saleRoute, saleRoutesCount) in saleRoutes">
                        <template v-for="(saleStaff, saleStaffCount) in saleRoute.SaleStaffs">
                            <template v-for="(customer, customerCount) in saleStaff.Customers">
                                <template v-for="(product, productCount) in customer.Products">
                                    <tr >
                                        <td v-if="saleRoutes.length > 1 && saleStaffCount == 0 && customerCount == 0 && productCount == 0" :rowspan="countNestedItems(saleRoute, ['SaleStaffs', 'Customers', 'Products'])">
                                            <div class="route-item">
                                                <IconRemove v-tooltip="{ content: 'Xóa bỏ xe này', placement: 'top' }" @click="orderStore.routeRemove(saleRoutesCount)"></IconRemove>
                                            </div>
                                        </td>
                                        <td class="!text-[17px] text-center" v-if="saleStaffCount == 0 && customerCount == 0 && productCount == 0" :rowspan="countNestedItems(saleRoute, ['SaleStaffs', 'Customers', 'Products'])">
                                            <span>{{ saleRoutesCount + 1 }}</span>
                                        </td>
                                        
                                        <!-- DeliveryStaff -->
                                        <td class="header-icon w-[10rem]" v-if="saleStaffCount == 0 && customerCount == 0 && productCount == 0" :rowspan="countNestedItems(saleRoute, ['SaleStaffs', 'Customers', 'Products'])">
                                            <div class="flex flex-col gap-1 w-[8rem]">
                                                <template v-for="(deliveryStaff, deliveryStaffCount) in saleRoute.DeliveryStaffs">
                                                    <div class="flex items-center gap-2">
                                                        <select2 class="form-control w-[90%]" required :options="master?.deliveryStaffs" v-model="deliveryStaff.id" label="DeliveryStaffName" :reduce="item => item" :option:selected="() => {}">
                                                            <template #search="{attributes, events}">
                                                                <input class="vs__search" :required="deliveryStaff.id == null || deliveryStaff.id == ''" v-bind="attributes" v-on="events" />
                                                            </template>
                                                        </select2>
                                                        <IconRemove v-tooltip="{ content: 'Xóa bỏ NVGN này', placement: 'top' }" @click="orderStore.deliveryStaffRemove(saleRoute, deliveryStaffCount)" v-show="saleRoute.DeliveryStaffs.length > 1"></IconRemove>
                                                    </div>
                                                </template>
                                            </div>

                                            <span class="header-icon-action" @click="orderStore.deliveryStaffAdd(saleRoute)" v-if="saleRoute.DeliveryStaffs.length < 3">
                                                <IconAdd v-tooltip="{ content: 'Thêm một nhân viên giao nhận vào xe này', placement: 'top' }"></IconAdd>
                                            </span>
                                        </td>

                                        <!-- SaleStaff -->
                                        <td class="header-icon row-left w-[10rem]" v-if="customerCount == 0 && productCount == 0" :rowspan="countNestedItems(saleStaff, ['Customers', 'Products'])">
                                            <div class="flex items-center w-[8rem]">
                                                <select2 class="form-control w-[90%]" required :options="master.saleStaffs" v-model="saleStaff.id" label="SaleStaffName" :reduce="item => item.id" :option:selected="() => {}">
                                                    <template #search="{attributes, events}">
                                                        <input class="vs__search" :required="saleStaff.id == null || saleStaff.id == ''" v-bind="attributes" v-on="events" />
                                                    </template>
                                                </select2>
                                                <IconRemove v-tooltip="{ content: 'Xóa bỏ NVBH này', placement: 'top' }" @click="orderStore.saleStaffRemove(saleRoute, saleStaffCount)" v-show="saleRoute.SaleStaffs.length > 1"></IconRemove>
                                            </div>
                                            <span class="header-icon-action" @click="orderStore.saleStaffAdd(saleRoute)" v-if="saleStaffCount == saleRoute.SaleStaffs.length - 1">
                                                <IconAdd v-tooltip="{ content: 'Thêm một nhân viên bán hàng vào tuyến này', placement: 'top' }"></IconAdd>
                                            </span>
                                        </td>

                                        <!-- Customer -->
                                        <td class="header-icon row-left w-[12rem]" v-if="productCount == 0" :rowspan="countNestedItems(customer, ['Products'])">
                                            <div class="flex items-center w-[10rem]">
                                                <select2 class="form-control w-[90%]" required :options="master.customers" v-model="customer.CustomerCode" label="CustomerName" :reduce="item => item.CustomerCode" :option:selected="() => {}">
                                                    <template #search="{attributes, events}">
                                                        <input class="vs__search" :required="customer.CustomerCode == null || customer.CustomerCode == ''" v-bind="attributes" v-on="events" />
                                                    </template>
                                                </select2>
                                                <IconRemove class="w-[10%]" v-tooltip="{ content: 'Xóa bỏ khách hàng này', placement: 'top' }" @click="orderStore.customerRemove(saleStaff, customerCount)" v-show="saleStaff.Customers.length > 1"></IconRemove>
                                            </div>
                                            <span class="header-icon-action" @click="orderStore.customerAdd({...saleStaff})" v-if="customerCount == saleStaff.Customers.length - 1">
                                                <IconAdd v-tooltip="{ content: 'Thêm một khách hàng cho NVBH này', placement: 'top' }"></IconAdd>
                                            </span>
                                        </td>

                                        <!-- Product -->
                                        <td class="header-icon w-[20rem]" :class="{'row-left': productCount > 0}">
                                            <div class="flex items-center w-[18rem]">
                                                <select2 class="form-control w-[90%]" required :options="master.stocks" v-model="product.ProductCode" label="ProductName" :reduce="item => item.ProductCode" :option:selected="() => {}">
                                                    <template #search="{attributes, events}">
                                                        <input class="vs__search" :required="product.ProductCode == null || product.ProductCode == ''" v-bind="attributes" v-on="events" />
                                                    </template>
                                                </select2>
                                                <IconRemove v-tooltip="{ content: 'Xóa bỏ sản phẩm này', placement: 'top' }" @click="orderStore.productRemove(customer, productCount)" v-show="customer.Products.length > 1"></IconRemove>
                                            </div>
                                            <span class="header-icon-action" @click="orderStore.productAdd(customer)" v-if="productCount == customer.Products.length - 1">
                                                <IconAdd v-tooltip="{ content: 'Thêm một sản phẩm cho khách hàng này', placement: 'top' }"></IconAdd>
                                            </span>
                                        </td>

                                        <td width="6rem">
                                            <div class="flex items-center gap-1">
                                                <input type="number" class="w-[4rem] text-right form-control" v-model="product.LargeUnitQty" min="0" v-select-on-focus>
                                                <span class="w-[3rem] text-sm pl-1">{{ getLargeUnit(product.ProductCode) }}</span>
                                            </div>
                                        </td>
                                        <td width="6rem">
                                            <div class="flex items-center gap-1">
                                                <input type="number" class="w-[4rem] flex-1 text-right form-control" v-model="product.SmallUnitQty" min="0" v-select-on-focus>
                                                <span class="w-[3rem] text-sm pl-1">{{ getSmallUnit(product.ProductCode) }}</span>
                                            </div>
                                        </td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                    </tr>
                                </template>
                            </template>
                        </template>
                    </template>
                </tbody>
            </table>
        </form>
    </Modal>
    <Confirm ref="confirm"></Confirm>
</template>
<style scoped>
</style>

<script setup>
import { onMounted, onBeforeMount, ref, watch, computed } from 'vue'
import { t } from '@/i18n'
import { helper } from '@/helper'
import { orderStore } from '@/store/order'
import { store } from '@/store'
import IconAdd from '@/views/component/icon/IconAdd.vue'
import IconRemove from '@/views/component/icon/IconRemove.vue'

const props = defineProps(['show'])
const emit = defineEmits(['close', 'save'])
const onClose = () => {
    emit('close', true)
}
const master = ref(store.master)
const saleRoutes = computed(() => orderStore.saleRoutes)
const deliveryStaffExists = []

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

const getLargeUnit = (ProductCode) => {
    return master.value.stocks.find(item => {
        return item.ProductCode == ProductCode
    })?.saleOffProduct?.LargeUnit
}

const getSmallUnit = (ProductCode) => {
    return master.value.stocks.find(item => {
        return item.ProductCode == ProductCode
    })?.saleOffProduct?.SmallUnit
}


onBeforeMount(async () => {
})

/**
 * Call API
 */
const onSave = async () => {
    const ok = await confirm.value.show({
        title: t("title.confirm"),
        message: 'Xác nhận xuất kho có tổng giá trị: '+price_total.value,
        cancelButton: t("button.back"),
    })
    if(ok) {
        await confirm.value.close()
        payload.value.exits = exits.value
    
        const res = await exitStore.store(payload.value).then((res) => {
            if(res && res.code == 200) {
                reload.value = true
                return true
            }
            return false
        })
        if(res) {
            await confirm.value.show({
                title: t("title.notify"),
                message: t("msg.save_ok"),
                cancelButton: t("button.back"),
                type: 1
            })
            exitStore.reset()
            emit('save', reload.value)
        }
    }
}

</script>