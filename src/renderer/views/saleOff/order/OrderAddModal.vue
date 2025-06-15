<template>
    <Modal :show="show" title="Tạo đơn hàng mới" maxWidth="max-w-7xl" @close="onClose()" class="">
        <form class="flex flex-col h-full gap-1 p-2" style="height: 42rem;" @submit.prevent="onSave()">
            <div class="flex gap-4">
                <fieldset class="w-[20%] form-input required">
                    <legend>{{ 'Mã xuất' }}</legend>
                    <input type="text" class="w-full text-center form-control" required v-model="payload.OrderCode">
                </fieldset>
                <fieldset class="w-[20%] form-input required">
                    <legend>{{ 'Ngày xuất' }}</legend>
                    <date class="w-full from-control" v-model="payload.OrderDate" required></date>
                </fieldset>
                <fieldset class="w-[20%] form-input">
                    <legend>{{ 'Ghi chú' }}</legend>
                    <input type="text" class="w-full form-control" v-model="payload.OrderNote">
                </fieldset>
            </div>
            
            <div class="flex justify-end gap-3">
                <button type="button" class="btn silver w-[6rem]" @click="reset()" tabindex="-1" :disabled="saleRoutes.length < 1">{{ t('button.reset') }}</button>
            </div>
            
            <div class="flex-1" style="overflow: auto;">
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
                                        <tr>
                                            <td v-if="saleRoutes.length > 1 && saleStaffCount == 0 && customerCount == 0 && productCount == 0" :rowspan="countNestedItems(saleRoute, ['SaleStaffs', 'Customers', 'Products'])" :style="{'backgroundColor': `${saleRoute.Background}`}">
                                                <div class="route-item">
                                                    <IconRemove v-tooltip="{ content: 'Xóa bỏ xe này', placement: 'top' }" @click="orderStore.routeRemove(saleRoutesCount)"></IconRemove>
                                                </div>
                                            </td>
                                            <td class="!text-[17px] text-center" v-if="saleStaffCount == 0 && customerCount == 0 && productCount == 0" :rowspan="countNestedItems(saleRoute, ['SaleStaffs', 'Customers', 'Products'])" :style="{'backgroundColor': `${saleRoute.Background}`}">
                                                <span>{{ saleRoutesCount + 1 }}</span>
                                            </td>
                                            
                                            <!-- DeliveryStaff -->
                                            <td class="w-[8rem]" v-if="saleStaffCount == 0 && customerCount == 0 && productCount == 0" :rowspan="countNestedItems(saleRoute, ['SaleStaffs', 'Customers', 'Products'])">
                                                <div class="flex items-center gap-1 ">
                                                    <div class="flex flex-col flex-1 gap-1">
                                                        <template v-for="(deliveryStaff, deliveryStaffCount) in saleRoute.DeliveryStaffs">
                                                            <div class="flex items-center gap-2">
                                                                <select2 class="w-full form-control"
                                                                    required
                                                                    :options="getDeliveryStaff()"
                                                                    v-model="deliveryStaff.id"
                                                                    label="DeliveryStaffName"
                                                                    :reduce="item => item.id"
                                                                    :selectable="item => !item.disabled"
                                                                    :option:selected="() => {}">
                                                                </select2>
                                                                <IconRemove v-tooltip="{ content: 'Xóa bỏ NVGN này', placement: 'top' }" @click="orderStore.deliveryStaffRemove(saleRoute, deliveryStaffCount)" v-show="saleRoute.DeliveryStaffs.length > 1"></IconRemove>
                                                            </div>
                                                        </template>
                                                    </div>
        
                                                    <span class="header-icon-action" @click="orderStore.deliveryStaffAdd(saleRoute)" v-if="saleRoute.DeliveryStaffs.length < 3">
                                                        <IconAdd v-tooltip="{ content: 'Thêm một nhân viên giao nhận vào xe này', placement: 'top' }"></IconAdd>
                                                    </span>
                                                </div>
                                            </td>
    
                                            <!-- SaleStaff -->
                                            <td class="row-left w-[8rem]" v-if="customerCount == 0 && productCount == 0" :rowspan="countNestedItems(saleStaff, ['Customers', 'Products'])">
                                                <div class="flex items-center gap-1 w-[full]">
                                                    <div class="flex items-center flex-1">
                                                        <select2 class="w-full form-control"
                                                        required
                                                        :options="getSaleStaff(saleRoute)"
                                                        v-model="saleStaff.id"
                                                        label="SaleStaffName"
                                                        :reduce="item => item.id"
                                                        :selectable="item => !item.disabled"
                                                        @update:modelValue="onSelectSaleStaff(saleStaff)">
                                                            <template #search="{attributes, events}">
                                                                <input class="vs__search" :required="saleStaff.id == null || saleStaff.id == ''" v-bind="attributes" v-on="events" />
                                                            </template>
                                                        </select2>
                                                        <IconRemove v-tooltip="{ content: 'Xóa bỏ NVBH này', placement: 'top' }" @click="orderStore.saleStaffRemove(saleRoute, saleStaffCount)" v-show="saleRoute.SaleStaffs.length > 1"></IconRemove>
                                                    </div>
                                                    <span class="header-icon-action" @click="orderStore.saleStaffAdd(saleRoute)" v-if="saleStaffCount == saleRoute.SaleStaffs.length - 1">
                                                        <IconAdd v-tooltip="{ content: 'Thêm một nhân viên bán hàng vào tuyến này', placement: 'top' }"></IconAdd>
                                                    </span>
                                                </div>
                                            </td>
    
                                            <!-- Customer -->
                                            <td class="row-left w-[14rem]" v-if="productCount == 0" :rowspan="countNestedItems(customer, ['Products'])">
                                                <div class="flex items-center gap-1 w-[full]">
                                                    <div class="flex items-center flex-1">
                                                        <select2 class="w-full form-control"
                                                        required
                                                        :options="getCustomers(saleStaff)"
                                                        v-model="customer.CustomerCode"
                                                        label="CustomerNameLabel"
                                                        :reduce="item => item.CustomerCode"
                                                        :selectable="item => !item.disabled"
                                                        :option:selected="() => {}">
                                                            <template #search="{attributes, events}">
                                                                <input class="vs__search" :required="customer.CustomerCode == null || customer.CustomerCode == ''" v-bind="attributes" v-on="events" />
                                                            </template>
                                                        </select2>
                                                        <IconRemove class="w-[10%]" v-tooltip="{ content: 'Xóa bỏ khách hàng này', placement: 'top' }" @click="orderStore.customerRemove(saleStaff, customerCount)" v-show="saleStaff.Customers.length > 1"></IconRemove>
                                                    </div>
                                                    <span class="header-icon-action" @click="orderStore.customerAdd({...saleStaff})" v-if="customerCount == saleStaff.Customers.length - 1 && saleStaff.Customers.length < master.customers.length">
                                                        <IconAdd v-tooltip="{ content: 'Thêm một khách hàng cho NVBH này', placement: 'top' }"></IconAdd>
                                                    </span>
                                                </div>
                                            </td>
    
                                            <!-- Product -->
                                            <td class="header-icon w-[20rem]" :class="{'row-left': productCount > 0}">
                                                <div class="flex items-center gap-1 w-[full]">
                                                    <div class="flex items-center flex-1">
                                                        <select2 class="w-full form-control" 
                                                        required
                                                        :options="getProducts(customer)"
                                                        v-model="product.ProductCode"
                                                        label="ProductName"
                                                        :reduce="item => item.ProductCode"
                                                        :selectable="item => !item.disabled"
                                                        :option:selected="onChangeProduct(product)"
                                                        >
                                                            <template #search="{attributes, events}">
                                                                <input class="vs__search" :required="product.ProductCode == null || product.ProductCode == ''" v-bind="attributes" v-on="events" />
                                                            </template>
                                                        </select2>
                                                        <IconRemove v-tooltip="{ content: 'Xóa bỏ sản phẩm này', placement: 'top' }" @click="orderStore.productRemove(customer, productCount)" v-show="customer.Products.length > 1"></IconRemove>
                                                    </div>
                                                    <span class="header-icon-action" @click="orderStore.productAdd(customer)" v-if="productCount == customer.Products.length - 1">
                                                        <IconAdd v-tooltip="{ content: 'Thêm một sản phẩm cho khách hàng này', placement: 'top' }"></IconAdd>
                                                    </span>
                                                </div>
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
                                            <td class="text-right">{{ product.PriceLabel }}</td>
                                            <td class="text-right">{{ product.PriceQtyLabel }}</td>
                                            <td>
                                                <input type="text" class="w-[8rem] form-control" v-model="product.Note" maxlength="200">
                                            </td>
                                        </tr>
                                    </template>
                                </template>
                            </template>
                        </template>
                    </tbody>
                </table>
            </div>


            <div class="py-1">
                <div class="flex justify-around w-full">
                    <button type="button" class="btn silver w-[6rem]" @click="onClose()" tabindex="-1">{{ $t("button.cancel") }}</button>
                    <button type="submit" class="btn w-[6rem]" :disabled="saleRoutes.length < 1" tabindex="-1">{{ $t("button.save") }}</button>
                </div>
            </div>
        </form>
    </Modal>
    <Confirm ref="confirm"></Confirm>
</template>
<style scoped>
</style>

<script setup>
import { onMounted, onBeforeMount, ref, watch, computed } from 'vue'
import moment from 'moment'
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
const reload = ref(false)
const confirm = ref(null)
const master = ref(store.master)
const saleRoutes = computed(() => orderStore.saleRoutes)
const payload = computed(() => orderStore.payload)

const reset = async () => {
    const ok = await confirm.value.show({
        title: t("title.confirm"),
        message: 'Xác nhận xóa bỏ thông tin xuất kho đã nhập?',
        cancelButton: t("button.back"),
    })
    if(ok) {
        confirm.value.close()
        orderStore.reset()
    }
}

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

const findProduct = (ProductCode) => {
    return master.value.stocks.find(item => {
        return item.ProductCode == ProductCode
    })?.saleOffProduct
}

const getLargeUnit = (ProductCode) => {
    return findProduct(ProductCode)?.LargeUnit
}

const getSmallUnit = (ProductCode) => {
    return findProduct(ProductCode)?.SmallUnit
}

const getDeliveryStaff = () => {
    let deliveryStaffs = helper.deepClone(master.value.deliveryStaffs)
    deliveryStaffs = deliveryStaffs.map((item) => {
        if(saleRoutes.value.find((saleRoute) => saleRoute.DeliveryStaffs.find((staff) => staff.id == item.id))) {
            item.disabled = true
        }
        return item
    })
    return deliveryStaffs
}

const getSaleStaff = (saleRoute) => {
    let saleStaffs = helper.deepClone(master.value.saleStaffs)
    saleStaffs = saleStaffs.map((item) => {
        if(saleRoute.SaleStaffs.find((i) => i.id == item.id)) {
            item.disabled = true
        }
        return item
    })
    return saleStaffs
}

const getCustomers = (saleStaff) => {
    let customers = helper.deepClone(master.value.customers)
    customers = customers.map((item) => {
        if(saleStaff.Customers.find((i) => i.CustomerCode == item.CustomerCode)) {
            item.disabled = true
        }
        return item
    })
    return customers
}

const getProducts = (customer) => {
    let products = helper.deepClone(master.value.stocks)
    products = products.map((item) => {
        if(customer.Products.find((product) => product.ProductCode == item.ProductCode)) {
            item.disabled = true
        }
        return item
    })
    return products
}


const onChangeProduct = (product) => {
    let prod = findProduct(product.ProductCode)

    if(!prod || !prod.SmallUnit) {
        product.SmallUnitQty = 0
    }

    if(prod) {
        product.Price = prod.Price
        product.PriceLabel = helper.format_number(product.Price)

        product.PriceQty = helper.unitQtyTransfer(product.LargeUnitQty, product.SmallUnitQty, prod) * product.Price
        product.PriceQtyLabel = helper.format_number(product.PriceQty)
    } else {
        product.Price = 0
        product.PriceLabel = helper.format_number(product.Price)

        product.PriceQty = 0
        product.PriceQtyLabel = helper.format_number(product.PriceQty)
    }
}

const onSelectSaleStaff = (saleStaff) => {
    const staff = master.value.saleStaffs.find((item) => {
        return item.id == saleStaff.id
    })
    if(staff && staff.customers.length > 0) {
        orderStore.customerClear(saleStaff)
        staff.customers.forEach((item, index) => {
            orderStore.customerAdd(saleStaff, item.CustomerCode)
        })
    }
}

onBeforeMount(async () => {
    if(!payload.value.OrderCode) {
        payload.value.OrderCode = helper.getOrderCode((master.value?.order_count ?? 0) + 1)
    }
    if(!payload.value.OrderDate) {
        payload.value.OrderDate = moment()
    }
})

/**
 * Call API
 */
const inValid = () => {
    for (let saleRoute of saleRoutes.value) {
        for (let deliveryStaff of saleRoute.DeliveryStaffs) {
            if(!deliveryStaff.id) {
                return 'Cần nhập thông tin nhân viên giao nhận.'
            }
        }
        for (let saleStaff of saleRoute.SaleStaffs) {
            if(!saleStaff.id) {
                return 'Cần nhập thông tin nhân viên bán hàng.'
            }
            for (let customer of saleStaff.Customers) {
                if(!customer.CustomerCode) {
                    return 'Cần nhập thông tin khách hàng.'
                }

                for (let product of customer.Products) {
                    if(!product.ProductCode) {
                        return 'Cần nhập thông tin sản phẩm.'
                    }
                }
            }
        }
    }

    return false
}
const getParams = () => {
    let SaleOffRoutes = []
    for (let saleRoute of saleRoutes.value) {
        let SaleOffRoute = {
            RouteNote: null,
            DeliveryStaffId1: null,
            DeliveryStaffId2: null,
            DeliveryStaffId3: null,
        }
        for (let deliveryStaffIndex in saleRoute.DeliveryStaffs) {
            if(deliveryStaffIndex == 0) {
                SaleOffRoute.DeliveryStaffId1 = saleRoute.DeliveryStaffs[deliveryStaffIndex].id
            }
            if(deliveryStaffIndex == 1) {
                SaleOffRoute.DeliveryStaffId2 = saleRoute.DeliveryStaffs[deliveryStaffIndex].id
            }
            if(deliveryStaffIndex == 2) {
                SaleOffRoute.DeliveryStaffId3 = saleRoute.DeliveryStaffs[deliveryStaffIndex].id
            }
        }
        
        let SaleOffOrderItems = []
        for (let saleStaff of saleRoute.SaleStaffs) {
            for (let customer of saleStaff.Customers) {
                for (let product of customer.Products) {
                    let SaleOffOrderItem = {
                        OrderItemNote: null,
                        SaleStaffId: null,
                        CustomerCode: null,
                        ProductCode: null,
                        LargeUnitQty: null,
                        SmallUnitQty: null,
                    }

                    SaleOffOrderItem.OrderItemNote = product.Note
                    SaleOffOrderItem.SaleStaffId = saleStaff.id
                    SaleOffOrderItem.CustomerCode = customer.CustomerCode
                    SaleOffOrderItem.ProductCode = product.ProductCode
                    SaleOffOrderItem.LargeUnitQty = product.LargeUnitQty
                    SaleOffOrderItem.SmallUnitQty = product.SmallUnitQty

                    SaleOffOrderItems.push(SaleOffOrderItem)
                }
            }
        }

        SaleOffRoute.SaleOffOrderItems = SaleOffOrderItems

        SaleOffRoutes.push(SaleOffRoute)
    }
    payload.value.SaleOffRoutes = SaleOffRoutes
    return payload.value
}
const onSave = async () => {
    const msg = inValid()
    if(msg) {
        await confirm.value.show({
            title: t("title.error"),
            message: msg,
            cancelButton: t("button.back"),
            type: 3
        })
    }

    const params = getParams()

    const res = await orderStore.store(params).then((res) => {
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
        orderStore.reset()
        emit('save', reload.value)
    }
    
}

</script>