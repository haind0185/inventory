<template>
    <div class="gap-1 wrapper-scroll">
        <form class="flex content-between gap-3" @submit.prevent="submit()">
            <div class="flex flex-col flex-1">
                <div class="flex w-full gap-3">
                    <fieldset class="form-input w-[30%]">
                        <legend>Mã sản phẩm</legend>
                        <input type="text" class="w-full form-control" v-model="search.ProductCode">
                    </fieldset>
    
                    <fieldset class="form-input w-[30%]">
                        <legend>Tên sản phẩm</legend>
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
                <Pagination v-if="products.total" v-model="search.page" class="mb-0" :page-count="products.page_count ?? 0" :click-handler="pagination"></Pagination>
                
            </div>
            <div class="flex justify-center w-[20%] items-center">
                <span v-if="products.total">
                    {{ format_number(products.firstItem) }}-{{ format_number(products.lastItem) }}/{{  format_number(products.total) }}
                </span>
            </div>
            <div class="flex justify-end w-[40%] gap-3">
                <button type="button" class="btn green w-[6rem]" @click="onShowAdd()">{{ $t("button.add") }}</button>
                <button type="button" class="btn silver w-[6rem]" @click="onShowImport()">{{ $t("button.import") }}</button>
            </div>
        </div>

        <div class="parent-scroll">
            <table class="view-scroll t-border">
                <thead>
                    <tr>
                        <th class="w-[9rem]">
                            <th-sort @sort="sort()" :search="search" :field="'ProductCode'">{{ $t("attr.product.ProductCode") }}</th-sort>
                        </th>
                        <th class="">
                            <th-sort @sort="sort()" :search="search" :field="'ProductName'">{{ $t("attr.product.ProductName") }}</th-sort>
                        </th>
                        <th class="w-[7rem]">
                            <th-sort @sort="sort()" :search="search" :field="'Price'">{{ $t("attr.product.Price") }}</th-sort>
                        </th>
                        <th class="w-[7rem]">{{ $t("attr.product.LargeUnit") }}</th>
                        <th class="w-[7rem]">{{ $t("attr.product.SmallUnit") }}</th>
                        <th class="w-[7rem]">
                            <th-sort @sort="sort()" :search="search" :field="'ConversionRate'">{{ $t("attr.product.ConversionRate") }}</th-sort>
                        </th>
                        <th class="w-[2rem]">
                            .
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="item in products.items">
                        <td class="text-center">{{ item.ProductCode }}</td>
                        <td class="text-left" style="font-size: 13px;">{{ item.ProductName }}</td>
                        <td class="text-center">{{ format_number(item.Price) }}</td>
                        <td class="text-center">{{ item.LargeUnit }}</td>
                        <td class="text-center">{{ item.SmallUnit }}</td>
                        <td class="text-center">{{ item.ConversionRate }}</td>
                        <td class="text-center">
                            <a href="javascript:void(0)" class="a-detail" @click="onShowDetail(item.ProductCode)">🃪</a>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <SaleOffProductAddModal
            v-if="showAdd"
            :show="showAdd"
            @close="onCloseAdd($event)"
            @save="onSaveAdd($event)" />

        <SaleOffProductDetailModal
            v-if="showDetail"
            :show="showDetail"
            :data="detail"
            @close="onCloseDetail($event)"
            @save="onSaveDetail($event)" />

        <SaleOffProductImportModal
            v-if="showImport"
            :show="showImport"
            @close="onCloseImport($event)"
            @save="onSaveImport($event)" />
    </div>
</template>

<script setup>
import { onMounted, onBeforeMount, computed, watch, ref } from 'vue'
import { saleOffProductStore } from '@/store/saleOffProduct';
import SaleOffProductAddModal from '@/views/saleOff/product/SaleOffProductAddModal.vue'
import SaleOffProductDetailModal from '@/views/saleOff/product/SaleOffProductDetailModal.vue'
import SaleOffProductImportModal from '@/views/saleOff/product/SaleOffProductImportModal.vue'

const showAdd = ref(false)
const showImport = ref(false)
const showDetail = ref(false)
const search = computed(() => saleOffProductStore.search)
const products = ref({})
const detail = ref({})

const onShowAdd = () => {
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

const onShowImport = () => {
    showImport.value = true
}
const onCloseImport = (event) => {
    showImport.value = false
    if(event) {
        index()
    }
}
const onSaveImport = (event) => {
    showImport.value = false
    if(event) {
        index()
    }
}

const clear = async () => {
    saleOffProductStore.resetSearch()
    await index()
}

const submit = async () => {
    saleOffProductStore.setSearch()
    await index()
}

const index = async () => {
    await saleOffProductStore.index(search.value).then((res) => {
        if(res && res.code == 200) {
            products.value = res.data
        }
    })
}

const sort = async () => {
    if (products.value.total > 0) {
        search.value.page = 1
        await index()
    }
}

const pagination = (page) => {
    search.value.page = page
    index()
}

const onShowDetail = async (ProductCode) => {
    await saleOffProductStore.show({ProductCode: ProductCode}).then((res) => {
        if(res && res.code == 200) {
            detail.value = res.data
            showDetail.value = true
        }
    })
}
const onCloseDetail = (event) => {
    showDetail.value = false
    if(event) {
        index()
    }
}
const onSaveDetail = (event) => {
    showDetail.value = false
    if(event) {
        index()
    }
}

onMounted(async () => {
    await index()
})
</script>