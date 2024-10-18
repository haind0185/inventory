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
                <li :active="route.name == menu.name">
                    <router-link :to="{name: menu.name}" class="menu-item"><span>{{ menu.label }}</span></router-link>
                </li>
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
        name: 'Inventory',
        label: 'Kho'
    },
    {
        name: 'Entry',
        label: 'Nhập kho'
    },
    {
        name: 'Exit',
        label: 'Xuất kho'
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