<template>
    <div class="gap-1 wrapper-scroll">
        <form class="flex content-between gap-3" @submit.prevent="index()">
            <div class="flex flex-col flex-1">
                <div class="flex w-full gap-3">
                    <fieldset class="form-input w-[30%]">
                        <legend>{{ $t("attr.entry.EntryCode") }}</legend>
                        <input type="text" class="w-full form-control" v-model="search.EntryCode">
                    </fieldset>
    
                    <fieldset class="form-input w-[40%]">
                        <legend>{{ $t("attr.entry.EntryDate") }}</legend>
                        <div class="flex gap-3">
                            <date class="w-full from-control" v-model="search.EntryDateFrom" :max-date="search.EntryDateTo"></date>
                            ~
                            <date class="w-full from-control" v-model="search.EntryDateTo" :min-date="search.EntryDateFrom"></date>
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
                        <th class="" colspan="2">{{ $t("attr.entry.ProductNameLabel") }}</th>
                        <th class="w-[7rem]">{{ $t("attr.entry.ExpiryDate") }}</th>
                        <th class="w-[5rem]">{{ $t("attr.entry.LargeUnitQty") }}</th>
                        <th class="w-[5rem]">{{ $t("attr.entry.SmallUnitQty") }}</th>
                        <th class="w-[6rem]">{{ $t("attr.entry.Price") }}</th>
                        <th class="w-[6rem]">{{ $t("attr.entry.Qty") }}</th>
                        <th class="w-[7rem]">{{ $t("attr.entry.PriceQty") }}</th>
                        <th class="w-[7rem]">{{ $t("attr.entry.Note") }}</th>
                    </tr>
                </thead>
                <tbody>
                    <template v-for="item in entries.items">
                        <tr style="background: #dfe6f5; cursor: pointer;">
                            <td class="w-[2.5rem] text-center show-list" @click="item.show = !item.show">{{ item.entries.length }}</td>
                            <td colspan="5" class="text-left" @click="item.show = !item.show">
                                [{{ item.show ? '-' : '+' }}] [Mã nhập: {{ item.EntryCode }}] [Ngày nhập: {{ item.EntryDate }}]
                            </td>
                            <td colspan="1" style="cursor: default;">
                                <div class="flex justify-end w-full">
                                    <a href="javascript:void(0)" class="link" @click="onShowDetail(item.EntryCode)">Chi tiết</a>
                                </div>
                            </td>
                            <td @click="item.show = !item.show" class="text-right">
                                {{ format_number(item.PriceQty) }}
                            </td>
                            <td></td>
                        </tr>
                        <tr v-for="(entry, index) in item.entries" v-show="item.show">
                            <td class="text-center">{{ index+1 }}</td>
                            <td class="text-left">{{ entry.product.ProductNameLabel }}</td>
                            <td class="text-center">{{ entry.ExpiryDate }}</td>
                            <td class="text-right">{{ format_number(entry.LargeUnitQty) }}</td>
                            <td class="text-right">{{ format_number(entry.SmallUnitQty) }}</td>
                            <td class="text-right">{{ format_number(entry.Price) }}</td>
                            <td class="text-right">{{ format_number(entry.Qty) }}</td>
                            <td class="text-right">{{ format_number(entry.PriceQty) }}</td>
                            <td class="text-left">{{ entry.Note }}</td>
                        </tr>
                    </template>
                </tbody>
            </table>
        </div>

        <EntryAdd
            v-if="showAdd"
            :show="showAdd"
            @close="onCloseAdd($event)"
            @save="onSaveAdd($event)" />

        <EntryDetail
            v-if="showDetail.show"
            :show="showDetail.show"
            :data="showDetail.data"
            @close="onCloseDetail($event)"
            @save="onSaveDetail($event)" />

        <Confirm ref="confirm"></Confirm>
    </div>
</template>

<script setup>
import { onMounted, onBeforeMount, computed, watch, ref } from 'vue'
import { entryStore } from '@/store/entry';
import { productStore } from '@/store/product';
import EntryAdd from './EntryAdd.vue';
import EntryDetail from './EntryDetail.vue';
import { t } from '@/i18n'

const showAdd = ref(false)
const showDetail = ref({
    show: false,
    data: null
})
const search = computed({
    get() {
        return entryStore.search;
    },
    set(value) {
        entryStore.search = value;
    },
})
const entries = ref({})
const confirm = ref(null)

const onShowAdd = async () => {
    await list()
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
    await list()
    await entryStore.show({EntryCode: EntryCode}).then((res) => {
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
    entryStore.resetSearch()
    await index()
}
const index = async () => {
    await entryStore.index(search.value).then((res) => {
        if(res && res.code == 200) {
            setData(res.data)
        }
    })
}

const setData = (data) => {
    entries.value = data
    entries.value.items.map(item => {
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
        await entryStore.destroy({EntryCode: EntryCode}).then(async (res) => {
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

const list = async () => {
    await productStore.list().then((res) => {
        if(res && res.code == 200) {
            entryStore.setProducts(res.data.items)
            return true
        }
    })
}

onMounted(async () => {
    await index()
})
</script>