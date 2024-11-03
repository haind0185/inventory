<template>
    <div class="gap-1 wrapper-scroll">
        <form class="flex content-between gap-3" @submit.prevent="index()">
            <div class="flex flex-col flex-1">
                <div class="flex w-full gap-3">
                    <fieldset class="form-input w-[30%]">
                        <legend>{{ $t("attr.exit.ExitCode") }}</legend>
                        <input type="text" class="w-full form-control" v-model="search.ExitCode">
                    </fieldset>
    
                    <fieldset class="form-input w-[40%]">
                        <legend>{{ $t("attr.exit.ExitDate") }}</legend>
                        <div class="flex gap-3">
                            <date class="w-full from-control" v-model="search.ExitDateFrom" :max-date="search.ExitDateTo"></date>
                            ~
                            <date class="w-full from-control" v-model="search.ExitDateTo" :min-date="search.ExitDateFrom"></date>
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
                <Pagination v-if="exits.total" v-model="search.page" class="mb-0" :page-count="exits.page_count ?? 0" :click-handler="pagination"></Pagination>
                
            </div>
            <div class="flex justify-center w-[20%] items-center">
                <span v-if="exits.total">
                    {{ format_number(exits.firstItem) }}-{{ format_number(exits.lastItem) }}/{{  format_number(exits.total) }}
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
                        <th class="" colspan="2">{{ $t("attr.exit.ProductNameLabel") }}</th>
                        <th class="w-[5rem]">{{ $t("attr.exit.LargeUnitQty") }}</th>
                        <th class="w-[5rem]">{{ $t("attr.exit.SmallUnitQty") }}</th>
                        <th class="w-[6rem]">{{ $t("attr.exit.Price") }}</th>
                        <th class="w-[6rem]">{{ $t("attr.exit.Qty") }}</th>
                        <th class="w-[7rem]">{{ $t("attr.exit.PriceQty") }}</th>
                    </tr>
                </thead>
                <tbody>
                    <template v-for="item in exits.items">
                        <tr style="background: #dfe6f5; cursor: pointer;" @click="item.show = !item.show">
                            <td class="w-[2.5rem] text-center show-list">{{ item.exits.length }}</td>
                            <td colspan="5" class="text-left">
                                [{{ item.show ? '-' : '+' }}] [Mã xuất: {{ item.ExitCode }}] [Ngày xuất: {{ item.ExitDate }}]
                            </td>
                            <td class="text-right">
                                {{ format_number(item.PriceQty) }}
                            </td>
                        </tr>
                        <tr v-for="(exit, index) in item.exits" v-show="item.show">
                            <td class="text-center">{{ index+1 }}</td>
                            <td class="text-left">{{ exit.product.ProductNameLabel }}</td>
                            <td class="text-right">{{ format_number(exit.LargeUnitQty) }}</td>
                            <td class="text-right">{{ format_number(exit.SmallUnitQty) }}</td>
                            <td class="text-right">{{ format_number(exit.Price) }}</td>
                            <td class="text-right">{{ format_number(exit.Qty) }}</td>
                            <td class="text-right">{{ format_number(exit.PriceQty) }}</td>
                        </tr>
                    </template>
                </tbody>
            </table>
        </div>

        <ExitAdd
            v-if="showAdd"
            :show="showAdd"
            @close="onCloseAdd($event)"
            @save="onSaveAdd($event)" />
    </div>
</template>

<script setup>
import { onMounted, onBeforeMount, computed, watch, ref } from 'vue'
import { exitStore } from '@/store/exit';
import { inventoryStore } from '@/store/inventory';
import ExitAdd from './ExitAdd.vue';

const showAdd = ref(false)
const search = computed(() => exitStore.search)
const exits = ref({})

const onShowAdd = async () => {
    showAdd.value = true
    await inventoriesList()
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
    exitStore.resetSearch()
    await index()
}
const index = async () => {
    await exitStore.index(search.value).then((res) => {
        if(res && res.code == 200) {
            setData(res.data)
        }
    })
}

const setData = (data) => {
    exits.value = data
    exits.value.items.map(item => {
        item.show = false
        return item
    })
}

const sort = async () => {
    if (exits.value.total > 0) {
        search.value.page = 1
        await index()
    }
}

const pagination = (page) => {
    search.value.page = page
    index()
}

const inventoriesList = async () => {
    await inventoryStore.list().then((res) => {
        if(res && res.code == 200) {
            exitStore.setInventories(res.data.items)
            return true
        }
    })
}

onMounted(async () => {
    await index()
})
</script>