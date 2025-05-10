<template>
    <div>
        <ul class="menus">
            <template v-for="menu in dashboard">
                <li :active="route.name == menu.name" class="item">
                    <router-link :to="{name: menu.name}" class="menu-item"><span>{{ menu.label }}</span></router-link>
                </li>
            </template>
        </ul>
        <ul class="menus">
            <template v-for="menu in menus">
                <template v-if="menu.children">
                    <li class="flex flex-col gap-2 item-parent" :class="{'active': menu.open || menu.children.find(item => item.name == route.name)}">
                        <span class="menu-item" @click="menu.open = !menu.open">
                            {{ menu.label }}
                        </span>
                        <ul v-show="menu.children.find(item => item.name == route.name) || menu.open" style="padding-left: 15px; padding-right: 5px;" class="flex flex-col gap-1">
                            <template v-for="item in menu.children">
                                <li :active="route.name == item.name" class="item">
                                    <router-link :to="{name: item.name}" class="menu-item"><span>{{ item.label }}</span></router-link>
                                </li>
                            </template>
                        </ul>
                    </li>
                </template>
                <template v-else>
                    <li :active="route.name == menu.name" class="item">
                        <router-link :to="{name: menu.name}" class="menu-item"><span>{{ menu.label }}</span></router-link>
                    </li>
                </template>
            </template>
        </ul>
        
        <div class="divider"></div>
        <span class="group-menu-title">Buôn hàng</span>

        <ul class="menus">
            <template v-for="menu in sale_off">
                <template v-if="menu.children">
                    <li class="flex flex-col gap-2 item-parent" :class="{'active': menu.open || menu.children.find(item => item.name == route.name)}">
                        <span class="menu-item" @click="menu.open = !menu.open">
                            {{ menu.label }}
                        </span>
                        <ul v-show="menu.children.find(item => item.name == route.name) || menu.open" style="padding-left: 15px; padding-right: 5px;" class="flex flex-col gap-1">
                            <template v-for="item in menu.children">
                                <li :active="route.name == item.name" class="item">
                                    <router-link :to="{name: item.name}" class="menu-item"><span>{{ item.label }}</span></router-link>
                                </li>
                            </template>
                        </ul>
                    </li>
                </template>
                <template v-else>
                    <li :active="route.name == menu.name" class="item">
                        <router-link :to="{name: menu.name}" class="menu-item"><span>{{ menu.label }}</span></router-link>
                    </li>
                </template>
            </template>
        </ul>

        <div class="divider"></div>

        <ul class="menus">
            <li class="flex flex-col gap-2 p-3 active setting">
                <ul style="padding-right: 5px;" class="flex flex-col gap-1">
                    <template v-for="item in setting">
                        <li class="item">
                            <a href="javascript:void(0)" class="justify-center menu-item" @click="item.action">{{ item.label }}</a>
                        </li>
                    </template>
                </ul>
            </li>
        </ul>
        <ul class="menus" v-if="isUpdateAvailable">
            <li class="flex flex-col gap-2 p-3 active setting">
                <ul style="padding-right: 5px;" class="flex flex-col gap-1">
                    <template v-for="item in update">
                        <li class="item">
                            <a href="javascript:void(0)" class="justify-center menu-item" @click="item.action">{{ item.label }}</a>
                        </li>
                    </template>
                </ul>
            </li>
        </ul>
    </div>
</template>

<script setup>
import { onMounted, onBeforeMount, computed, watch, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { inventoryStore } from '@/store/inventory';
import { store } from '@/store'

const route = useRoute()
const isUpdateAvailable = computed(() => store.isUpdateAvailable)
const menus = ref([
    {
        name: 'Inventories',
        label: 'Kho',
        children: [
            {
                name: 'InventoryTotal',
                label: 'Kho Tổng',
            },
            {
                name: 'Inventory',
                label: 'Kho theo HSD',
            },
            {
                name: 'InventoryProduct',
                label: 'Lịch sử mặt hàng',
            },
            {
                name: 'InventorySafetyStock',
                label: 'Tồn kho an toàn',
            },
        ],
        open: false
    },
    {
        name: 'Entries',
        label: 'Nhập kho',
        children: [
            {
                name: 'Entry',
                label: 'NK theo đơn',
            },
            {
                name: 'EntryProduct',
                label: 'NK theo sản phẩm',
            },
            {
                name: 'EntryDate',
                label: 'NK theo ngày',
            },
            // {
            //     name: 'EntryProductExpiry',
            //     label: 'NK theo HSD',
            // },
        ],
        open: false,
    },
    {
        name: 'Exits',
        label: 'Xuất kho',
        children: [
            {
                name: 'Exit',
                label: 'XK theo đơn',
            },
            {
                name: 'ExitProduct',
                label: 'XK theo sản phẩm',
            },
            {
                name: 'ExitDate',
                label: 'XK theo ngày',
            },
        ],
    },
    {
        name: 'Products',
        label: 'Mặt hàng'
    },
])

const dashboard = ref([
    {
        name: 'Dashboard',
        label: 'Dashboard',
    },
    {
        name: 'Compare',
        label: 'So sánh file',
    },
])

const setting = ref([
    {
        name: 'DatabaseDownload',
        label: 'Tải xuống Data',
        action: async () => {
            await inventoryStore.database().then((res) => {
                
            })
        }
    },
])

const update = ref([
    {
        name: 'UpdateVersion',
        label: 'Có cập nhật!',
        action: async () => {
            await store.setUpdateDownloaded()
        }
    },
])

const sale_off = ref([
    {
        name: 'SaleOffSaleOff',
        label: 'Quản lý buôn hàng',
        children: [
            {
                name: 'SaleOffProduct',
                label: 'Sản phẩm',
            },
            {
                name: 'SaleStaff',
                label: 'NV bán hàng',
            },
            {
                name: 'DeliveryStaff',
                label: 'NV giao nhận',
            },
            {
                name: 'Customer',
                label: 'DS khách hàng',
            },
        ],
        open: false
    },
])

</script>