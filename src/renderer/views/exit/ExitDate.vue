<template>
    <div class="gap-1 wrapper-scroll">
        <form class="flex justify-between gap-3" @submit.prevent="submit()">
            <div class="flex flex-col w-[60%] gap-1">
                <div class="flex w-full gap-3">
                    <fieldset class="form-input w-[60%]">
                        <legend>{{ $t("attr.exit.ExitDate") }}</legend>
                        <div class="flex gap-3">
                            <date class="w-full from-control" v-model="search.ExitDateFrom" :max-date="search.ExitDateTo"></date>
                            ~
                            <date class="w-full from-control" v-model="search.ExitDateTo" :min-date="search.ExitDateFrom"></date>
                        </div>
                    </fieldset>
                </div>
            </div>
            <div class="flex flex-col justify-end gap-1 w-[6rem]">
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
            </div>
        </div>

        <div class="parent-scroll">
            <table class="view-scroll t-border">
                <thead>
                    <tr>
                        <th class="" colspan="3">{{ 'SL' }}</th>
                        <th class="w-[50%]">{{ $t("attr.exit.ProductNameLabel") }}</th>

                        <th class="w-[5rem]">{{ $t("attr.exit.LargeUnitQty") }}</th>
                        <th class="w-[5rem]">{{ $t("attr.exit.SmallUnitQty") }}</th>
                        <th class="w-[5rem]">{{ $t("attr.exit.Qty") }}</th>
                        <th class="w-[5rem]">{{ $t("attr.exit.Price") }}</th>
                        <th class="w-[5rem]">{{ $t("attr.exit.PriceQty") }}</th>
                        <th class="w-[5rem]">{{ $t("attr.exit.Note") }}</th>
                    </tr>
                </thead>
                <tbody>
                    <template v-for="item in exits.items">
                        <tr style="background: #dfe6f5; cursor: pointer;" @click="item.show = !item.show">
                            <td class="text-center show-list w-[2rem]" colspan="3">{{ item.codes.length }}</td>
                            <td colspan="7" class="text-left w-[94%]">
                                [{{ item.show ? '-' : '+' }}] {{ item.ExitDate }}
                            </td>
                        </tr>
                        <template v-for="(code, i) in item.codes">
                            <tr style="background: #c3bfc554; cursor: pointer;" @click="code.show = !code.show" v-if="item.show">
                                <td class="w-[2rem]" v-if="i == 0" :rowspan="item.codes.length + item.codes.filter(item => item.show == true).reduce((sum, item) => {return sum + item.exits.length}, 0)"></td>
                                <td class="text-center show-list row-left" colspan="2">{{ code.exits.length }}</td>
                                <td colspan="7" class="text-left w-[94%]">
                                    [{{ code.show ? '-' : '+' }}] {{ code.ExitCode }}
                                </td>
                            </tr>
                            <tr v-for="(exit, index) in code.exits" v-if="code.show && item.show">
                                <td class="w-[2rem] row-left" v-if="index == 0" :rowspan="code.exits.length"></td>
                                <td class="text-center w-[2rem] row-left">{{ index+1 }}</td>
                                <td class="text-left">{{ exit.ProductNameLabel }}</td>
                                <td class="text-right">{{ format_number(exit.LargeUnitQty) }}</td>
                                <td class="text-right">{{ format_number(exit.SmallUnitQty) }}</td>
                                <td class="text-right">{{ format_number(exit.Qty) }}</td>
                                <td class="text-right">{{ format_number(exit.Price) }}</td>
                                <td class="text-right">{{ format_number(exit.PriceQty) }}</td>
                                <td class="text-left">{{ exit.Note }}</td>
                            </tr>
                        </template>
                    </template>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script setup>
import { onMounted, onBeforeMount, computed, watch, ref } from 'vue'
import { exitStore } from '@/store/exit';
import { productStore } from '@/store/product';

const search = computed(() => exitStore.dateSearch)
const exits = ref({})

const submit = async () => {
    exitStore.setDateSearch()
    await index()
}

const index = async () => {
    await exitStore.date(search.value).then((res) => {
        if(res && res.code == 200) {
            setData(res.data)
        }
    })
}

const setData = (data) => {
    exits.value = data
    exits.value.items.map(item => {
        item.codes = item.codes.map(i => {
            i.show = false
            return i
        })
        item.show = false
        return item
    })
}

const clear = async () => {
    exitStore.resetDateSearch()
    await index()
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

onMounted(async () => {
    await index()
})
</script>