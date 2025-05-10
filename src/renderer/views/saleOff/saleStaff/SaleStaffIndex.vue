<template>
    <div class="gap-1 wrapper-scroll">
        <form class="flex content-between gap-3" @submit.prevent="submit()">
            <div class="flex flex-col flex-1">
                <div class="flex w-full gap-5">

                    <!-- SaleStaffName -->
                    <fieldset class="form-input w-[30%]">
                        <legend>Tên NV bán hàng</legend>
                        <input type="text" class="w-full form-control" v-model="search.SaleStaffName">
                    </fieldset>

                    <!-- SaleStaffActive -->
                    <fieldset class="w-[40%] form-input required">
                        <legend>Tình trạng</legend>
                        <template v-if="ACTIVE_LIST">
                            <div class="flex gap-4">
                                <label class="flex items-center gap-1">
                                    <input type="radio" class="" name="title-active-01" :value="null" v-model="search.SaleStaffActive">{{ "Tất cả" }}
                                </label>
                                <label class="flex items-center gap-1" v-for="[key, value] of Object.entries(ACTIVE_LIST)">
                                    <input type="radio" class="" name="title-active-01" :value="key" v-model="search.SaleStaffActive">{{ value }}
                                </label>
                            </div>
                        </template>
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
                <Pagination v-if="items.total" v-model="search.page" class="mb-0" :page-count="items.page_count ?? 0" :click-handler="pagination"></Pagination>
                
            </div>
            <div class="flex justify-center w-[20%] items-center">
                <span v-if="items.total">
                    {{ format_number(items.firstItem) }}-{{ format_number(items.lastItem) }}/{{  format_number(items.total) }}
                </span>
            </div>
            <div class="flex justify-end w-[40%] gap-3">
                <button type="button" class="btn green w-[6rem]" @click="onShowAdd()">{{ $t("button.add") }}</button>
            </div>
        </div>

        <div class="parent-scroll">
            <table class="view-scroll t-border">
                <thead>
                    <tr>
                        <th class="">
                            <th-sort @sort="sort()" :search="search" :field="'SaleStaffName'">Tên NV bán hàng</th-sort>
                        </th>
                        <th class="">
                            <th-sort @sort="sort()" :search="search" :field="'SaleStaffActive'">Tình trạng</th-sort>
                        </th>
                        <th class="w-[4rem]">
                            .
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="item in items.items">
                        <td class="text-center" style="font-size: 13px;">{{ item.SaleStaffName }}</td>
                        <td class="text-center">{{ item.ActiveLabel }}</td>
                        <td class="text-center">
                            <a href="javascript:void(0)" class="a-detail" @click="onShowDetail(item.id)">🃪</a>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <SaleStaffAddModel
            v-if="showAdd"
            :show="showAdd"
            @close="onCloseAdd($event)"
            @save="onSaveAdd($event)" />

        <SaleStaffDetailModal
            v-if="showDetail"
            :show="showDetail"
            :data="detail"
            @close="onCloseDetail($event)"
            @save="onSaveDetail($event)" />
    </div>
</template>

<script setup>
import { onMounted, onBeforeMount, computed, watch, ref } from 'vue'
import { saleStaffStore } from '@/store/saleStaff'
import SaleStaffAddModel from '@/views/saleOff/saleStaff/SaleStaffAddModel.vue'
import SaleStaffDetailModal from '@/views/saleOff/saleStaff/SaleStaffDetailModal.vue'
import { ACTIVE_LIST } from '@/constant'

const showAdd = ref(false)
const showDetail = ref(false)
const search = computed(() => saleStaffStore.search)
const items = ref({})
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

const onShowDetail = async (id) => {
    await saleStaffStore.show({id: id}).then((res) => {
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

const clear = async () => {
    saleStaffStore.resetSearch()
    await index()
}

const submit = async () => {
    saleStaffStore.setSearch()
    await index()
}

const index = async () => {
    await saleStaffStore.index(search.value).then((res) => {
        if(res && res.code == 200) {
            items.value = res.data
        }
    })
}

const sort = async () => {
    if (items.value.total > 0) {
        search.value.page = 1
        await index()
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