<template>
    <div class="gap-1 wrapper-scroll">
        <form class="flex content-between gap-3" @submit.prevent="index()">
            <div class="flex flex-col flex-1">
                <div class="flex w-full gap-3">
                    <fieldset class="form-input w-[30%]">
                        <legend>{{ $t("attr.entry.EntryCode") }}</legend>
                        <input type="text" class="w-full form-control" v-model="search.EntryCode">
                    </fieldset>
    
                    <fieldset class="form-input w-[30%]">
                        <legend>{{ $t("attr.entry.EntryDate") }}</legend>
                        <date class="w-full from-control" v-model="search.EntryDate"></date>
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
                <Pagination v-if="entries.total" v-model="search.page" class="mb-0" :page-count="entries.page_count ?? 0" :click-handler="pagination"></Pagination>
                
            </div>
            <div class="flex justify-center w-[20%] items-center">
                <span v-if="entries.total">
                    {{ format_number(entries.firstItem) }}-{{ format_number(entries.lastItem) }}/{{  format_number(entries.total) }}
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
                            <th-sort @sort="sort()" :search="search" :field="'EntryDate'">{{ $t("attr.entry.EntryCode") }}<br>{{  $t("attr.entry.EntryDate") }}</th-sort>
                        </th>
                        <th>
                            <th-sort @sort="sort()" :search="search" :field="'ProductCode'">{{ $t("attr.entry.ProductCode") }}</th-sort>
                        </th>
                        <th>{{ $t("attr.entry.LargeUnitQty") }}</th>
                        <th>{{ $t("attr.entry.SmallUnitQty") }}</th>
                        <th>{{ $t("attr.entry.ExpiryDate") }}</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="item in entries.items">
                        <td class="text-center">{{ item.EntryCode }}<br>{{ item.EntryDate }}</td>
                        <td class="text-left">{{ item.ProductCode }}</td>
                        <td class="text-center">{{ item.LargeUnitQty }}</td>
                        <td class="text-center">{{ item.SmallUnitQty }}</td>
                        <td class="text-center">{{ item.ExpiryDate }}</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <EntryAdd
            v-if="showAdd"
            :show="showAdd"
            @close="onCloseAdd($event)"
            @save="onSaveAdd($event)" />
    </div>
</template>

<script setup>
import { onMounted, onBeforeMount, computed, watch, ref } from 'vue'
import { entryStore } from '@/store/entry';
import EntryAdd from './EntryAdd.vue';

const showAdd = ref(false)
const search = computed(() => entryStore.search)
const entries = ref({})

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

const clear = async () => {
    entryStore.resetSearch()
    await index()
    console.log(search.value)
}
const index = async () => {
    await entryStore.index(search.value).then((res) => {
        if(res && res.code == 200) {
            entries.value = res.data
        }
    })
}

const sort = async () => {
    if (entries.value.total > 0) {
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