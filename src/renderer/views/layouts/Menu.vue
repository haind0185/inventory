<template>
    <div>
        <ul class="menus">
            <template v-for="menu in dashboard">
                <li :active="route.name == menu.name">
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
    </div>
</template>

<script setup>
import { onMounted, onBeforeMount, computed, watch, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const route = useRoute()

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
                name: 'EntryProductExpiry',
                label: 'NK theo HSD',
            },
            {
                name: 'EntryDate',
                label: 'NK theo ngày',
            },
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
    }
])

</script>