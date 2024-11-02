<template>
    <Modal :show="show" :title="title" maxWidth="max-w-6xl" @close="onClose()" class="">
        <div class="flex flex-col h-full gap-1 p-2" style="height: 40rem; overflow-y: hidden;">
            <div class="parent-scroll" style="overflow: auto;">
                <table class="view-scroll t-border">
                    <thead>
                        <tr class="text-center">
                            <th class="w-[5rem]" rowspan="2">
                                {{ $t("attr.inventory.ProductCode") }}
                            </th>
                            <th class="" rowspan="2">
                                {{ $t("attr.inventory.ProductName") }}
                            </th>
                            <th colspan="3">
                                Trong kho
                            </th>
                            <th colspan="3">
                                Trong file
                            </th>
                            <th colspan="3">
                                Lệch
                            </th>
                        </tr>
                        <tr class="text-center">
                            <th class="w-[4rem]">
                                {{ $t("attr.inventory.LargeUnitQty") }}
                            </th>
                            <th class="w-[4rem]">
                                {{ $t("attr.inventory.SmallUnitQty") }}
                            </th>
                            <th class="w-[5rem]">
                                {{ $t("attr.inventory.Qty") }}
                            </th>
                            <th class="w-[4rem]">
                                {{ $t("attr.inventory.LargeUnitQty") }}
                            </th>
                            <th class="w-[4rem]">
                                {{ $t("attr.inventory.SmallUnitQty") }}
                            </th>
                            <th class="w-[5rem]">
                                {{ $t("attr.inventory.Qty") }}
                            </th>
                            <th class="w-[4rem]">
                                {{ $t("attr.inventory.LargeUnitQty") }}
                            </th>
                            <th class="w-[4rem]">
                                {{ $t("attr.inventory.SmallUnitQty") }}
                            </th>
                            <th class="w-[5rem]">
                                {{ $t("attr.inventory.Qty") }}
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="item in data" :class="item.Class">
                            <td class="text-center">{{ item.ProductCode }}</td>
                            <td class="text-left">{{ item.ProductName }}</td>
                            <td class="text-right">{{ format_number(item.LargeUnitQty) }}</td>
                            <td class="text-right">{{ format_number(item.SmallUnitQty) }}</td>
                            <td class="text-right">{{ format_number(item.Qty) }}</td>

                            <td class="text-right">{{ format_number(item.CheckLargeUnitQty) }}</td>
                            <td class="text-right">{{ format_number(item.CheckSmallUnitQty) }}</td>
                            <td class="text-right">{{ format_number(item.CheckQty) }}</td>

                            <td class="text-right">{{ format_number(item.DiscLargeUnitQty) }}</td>
                            <td class="text-right">{{ format_number(item.DiscSmallUnitQty) }}</td>
                            <td class="text-right">{{ format_number(item.DiscQty) }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div class="flex justify-around w-full pt-3">
                <button type="button" class="btn silver w-[6rem]" @click="onClose()">{{ $t("button.cancel") }}</button>
                <button type="button" class="btn w-[6rem]" @click="exportFile()">{{ $t("button.export") }}</button>
            </div>
        </div>
    </Modal>
    <Confirm ref="confirm"></Confirm>
</template>
<style scoped>
    .bg-1warning {
        background-color: #edc4c4;
    }
    .bg-2omg {
        background-color: #d6f9ff;
    }
    .bg-3notfound {
        background-color: #ccc;
    }
</style>

<script setup>
import { onMounted, onBeforeMount, ref, watch, computed } from 'vue'
import { t } from '@/i18n'
import { helper } from '@/helper';
import { inventoryStore } from '@/store/inventory';

const title = t("modal.stocktaking")
const props = defineProps(['show', 'data'])
const emit = defineEmits(['close'])
const onClose = () => {
    emit('close')
}
const exportFile = async () => {
    await inventoryStore.exportStocktaking({data: props.data}).then((res) => {
        if(res && res.code == 200) {
            console.log(res)
        }
    })
}
</script>