<template>
    <div class="gap-1 wrapper-scroll">
        <form class="flex content-between gap-3" @submit.prevent="submit()">
            <div class="flex flex-col flex-1">
                <div class="flex w-[60%] gap-5">
                    <!-- CustomerCode -->
                    <fieldset class="form-input w-[50%]">
                        <legend>Mã khách hàng</legend>
                        <input type="text" class="w-full form-control" v-model="search.CustomerCode">
                    </fieldset>

                    <!-- CustomerName -->
                    <fieldset class="w-[50%] form-input">
                        <legend>Tên khách hàng</legend>
                        <input type="text" class="w-full form-control" v-model="search.CustomerName">
                    </fieldset>
                </div>
                <div class="flex w-[60%] gap-5">
                    <!-- CustomerAddress -->
                    <fieldset class="w-full form-input">
                        <legend>Địa chỉ</legend>
                        <input type="text" class="w-full form-control" v-model="search.CustomerAddress">
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
                            <th-sort @sort="sort()" :search="search" :field="'CustomerCode'">Mã khách hàng</th-sort>
                        </th>
                        <th class="">
                            <th-sort @sort="sort()" :search="search" :field="'CustomerName'">Tên khách hàng</th-sort>
                        </th>
                        <th class="">
                            <th-sort @sort="sort()" :search="search" :field="'CustomerAddress'">Địa chỉ</th-sort>
                        </th>
                        <th class="w-[4rem]">
                            .
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="item in items.items">
                        <td class="text-center">{{ item.CustomerCode }}</td>
                        <td class="text-left">{{ item.CustomerName }}</td>
                        <td class="text-left">{{ item.CustomerAddress }}</td>
                        <td class="text-center">
                            <a href="javascript:void(0)" class="a-detail" @click="onShowDetail(item.CustomerCode)">🃪</a>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <CustomerAddModal
            v-if="showAdd"
            :show="showAdd"
            @close="onCloseAdd($event)"
            @save="onSaveAdd($event)" />

        <CustomerDetailModel
            v-if="showDetail"
            :show="showDetail"
            :data="detail"
            @close="onCloseDetail($event)"
            @save="onSaveDetail($event)" />
    </div>
</template>

<script setup>
import { onMounted, onBeforeMount, computed, watch, ref } from 'vue'
import { customerStore } from '@/store/customer'
import CustomerAddModal from '@/views/saleOff/customer/CustomerAddModal.vue'
import CustomerDetailModel from '@/views/saleOff/customer/CustomerDetailModel.vue'

const showAdd = ref(false)
const showDetail = ref(false)
const search = computed(() => customerStore.search)
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

const onShowDetail = async (CustomerCode) => {
    await customerStore.show({CustomerCode: CustomerCode}).then((res) => {
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
    customerStore.resetSearch()
    await index()
}

const submit = async () => {
    customerStore.setSearch()
    await index()
}

const index = async () => {
    await customerStore.index(search.value).then((res) => {
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