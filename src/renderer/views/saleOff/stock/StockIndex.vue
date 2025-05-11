<template>
    <div class="gap-1 wrapper-scroll">
        <form class="flex content-between gap-3" @submit.prevent="index()">
            <div class="flex flex-col flex-1">
                <div class="flex w-full gap-3">
                    <fieldset class="form-input w-[30%]">
                        <legend>Mã nhập hàng</legend>
                        <input type="text" class="w-full form-control" v-model="search.StockInCode">
                    </fieldset>
    
                    <fieldset class="form-input w-[40%]">
                        <legend>Ngày nhập hàng</legend>
                        <div class="flex gap-3">
                            <date class="w-full from-control" v-model="search.StockInDateFrom" :max-date="search.StockInDateTo"></date>
                            ~
                            <date class="w-full from-control" v-model="search.StockInDateTo" :min-date="search.StockInDateFrom"></date>
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
                <Pagination v-if="items.total" v-model="search.page" class="mb-0" :page-count="items.page_count ?? 0" :click-handler="pagination"></Pagination>
                
            </div>
            <div class="flex justify-center w-[20%] items-center">
                <span v-if="items.total">
                    {{ format_number(items.firstItem) }}-{{ format_number(items.lastItem) }}/{{  format_number(items.total) }}
                </span>
            </div>
            <div class="flex justify-end w-[40%] gap-3">
                <button type="button" class="btn green w-[6rem]" @click="onShowAdd()" tabindex="-1">{{ $t("button.add") }}</button>
            </div>
        </div>

        <div class="parent-scroll">
            <table class="view-scroll t-border">
                <thead>
                    <tr>
                        <th class="" colspan="2">Sản phẩm</th>
                        <th class="w-[4rem]">Số lượng (ĐV1)</th>
                        <th class="w-[4rem]">Số lượng (ĐV2)</th>
                        <th class="w-[12rem]">Ghi chú</th>
                    </tr>
                </thead>
                <tbody>
                    <template v-for="item in items.items">
                        <tr style="background: #dfe6f5; cursor: pointer;">
                            <td class="w-[2.5rem] text-center show-list" @click="item.show = !item.show">{{ item.items.length }}</td>
                            <td colspan="2" class="text-xs text-left" @click="item.show = !item.show">
                                [{{ item.show ? '-' : '+' }}] [Mã nhập: {{ item.StockInCode }}] [Ngày nhập: {{ item.StockInDate }}]
                            </td>
                            <td colspan="1" style="cursor: default;">
                                <div class="flex justify-end w-full">
                                    <a href="javascript:void(0)" class="link" @click="onShowDetail(item.StockInCode)" tabindex="-1">Chi tiết</a>
                                </div>
                            </td>
                            <td class="!text-xs text-left">{{ item.StockInNote }}</td>
                        </tr>
                        <tr v-for="(item, index) in item.saleOffStockInItems" v-show="item.show">
                            <td class="text-center">{{ index+1 }}</td>
                            <td class="text-left">{{ item.saleOffProduct.ProductName }}</td>
                            <td class="text-right">{{ format_number(item.LargeUnitQty) }}</td>
                            <td class="text-right">{{ format_number(item.SmallUnitQty) }}</td>
                            <td class="!text-xs text-left">{{ item.StockInItemNote }}</td>
                        </tr>
                        <tr v-show="item.show">
                            <td colspan="2" class="!font-bold text-right">Tổng cộng: </td>
                            <td class="!font-bold text-right">
                                {{ format_number(item.saleOffStockInItems.reduce((sum, item) => sum + item.LargeUnitQty, 0)) }}
                            </td>
                            <td class="!font-bold text-right">
                                {{ format_number(item.saleOffStockInItems.reduce((sum, item) => sum + item.SmallUnitQty, 0)) }}
                            </td>
                            <td></td>
                        </tr>
                    </template>
                </tbody>
            </table>
        </div>

        <!-- <EntryAdd
            v-if="showAdd"
            :show="showAdd"
            @close="onCloseAdd($event)"
            @save="onSaveAdd($event)" />

        <EntryDetail
            v-if="showDetail.show"
            :show="showDetail.show"
            :data="showDetail.data"
            @close="onCloseDetail($event)"
            @save="onSaveDetail($event)" /> -->

        <Confirm ref="confirm"></Confirm>
    </div>
</template>

<script setup>
import { onMounted, onBeforeMount, computed, watch, ref } from 'vue'
import { stockInStore } from '@/store/stockIn';
// import EntryAdd from './EntryAdd.vue';
// import EntryDetail from './EntryDetail.vue';
import { t } from '@/i18n'

const showAdd = ref(false)
const showDetail = ref({
    show: false,
    data: null
})
const search = computed({
    get() {
        return stockInStore.search;
    },
    set(value) {
        stockInStore.search = value;
    },
})
const items = ref({})
const confirm = ref(null)

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

const onShowDetail = async (EntryCode) => {
    await stockInStore.show({EntryCode: EntryCode}).then((res) => {
        if(res && res.code == 200) {
            showDetail.value.data = res.data
            showDetail.value.show = true
        }
    })
}
const onCloseDetail = (event) => {
    showDetail.value.show = false
    showDetail.value.data = null
    if(event) {
        index()
    }
}
const onSaveDetail = (event) => {
    showDetail.value.show = false
    showDetail.value.data = null
    if(event) {
        index()
    }
}

const clear = async () => {
    stockInStore.resetSearch()
    await index()
}
const index = async () => {
    await stockInStore.index(search.value).then((res) => {
        if(res && res.code == 200) {
            setData(res.data)
        }
    })
}

const setData = (data) => {
    items.value = data
    items.value.items.map(item => {
        item.show = false
        return item
    })
}

const onDelete = async (EntryCode) => {
    const ok = await confirm.value.show({
        title: t("title.confirm"),
        message: `Cân nhắc kỹ trước khi khóa.<br>Xác nhận xóa đơn nhập kho có mã: ${EntryCode}`,
        cancelButton: t("button.back"),
    })
    if(ok) {
        await confirm.value.close()
        await stockInStore.destroy({EntryCode: EntryCode}).then(async (res) => {
        if(res && res.code == 200) {
            await index()
        }
    })
    }
    
}

const pagination = (page) => {
    search.value.page = page
    index()
}

onMounted(async () => {
    await index()
})
</script>