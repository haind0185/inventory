<template>
    <div class="gap-1 wrapper-scroll">
        <form class="flex content-between gap-3" @submit.prevent="index()">
            <div class="flex flex-col flex-1">
                <div class="flex w-full gap-3">
                    <fieldset class="form-input w-[30%]">
                        <legend>{{ $t("attr.exit.ExitCode") }}</legend>
                        <input type="text" class="w-full form-control" v-model="search.ExitCode">
                    </fieldset>
    
                    <fieldset class="form-input w-[30%]">
                        <legend>{{ $t("attr.exit.ExitDate") }}</legend>
                        <date class="w-full from-control" v-model="search.ExitDate"></date>
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
                        <th>
                            <th-sort @sort="sort()" :search="search" :field="'ExitDate'">{{ $t("attr.exit.ExitCode") }}<br>{{  $t("attr.exit.ExitDate") }}</th-sort>
                        </th>
                        <th>
                            <th-sort @sort="sort()" :search="search" :field="'ProductCode'">{{ $t("attr.exit.ProductNameLabel") }}</th-sort>
                        </th>
                        <th>{{ $t("attr.exit.LargeUnitQty") }}</th>
                        <th>{{ $t("attr.exit.SmallUnitQty") }}</th>
                    </tr>
                </thead>
                <tbody>
                    <template v-for="item in exits.items">
                        <tr v-for="(exit, index) in item.exits">
                            <td class="text-center" :rowspan="item.exits.length" v-if="index == 0">{{ item.ExitCode }}<br>{{ item.ExitDate }}</td>
                            <td class="text-left" :class="{'row-left': index >= 1}">{{ exit.product.ProductNameLabel }}</td>
                            <td class="text-center">{{ `${exit.LargeUnitQty} ${exit.product.LargeUnit}` }}</td>
                            <td class="text-center">{{ exit.product.SmallUnit ? `${exit.SmallUnitQty} ${exit.product.SmallUnit}` : '' }}</td>
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
            exits.value = res.data
        }
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