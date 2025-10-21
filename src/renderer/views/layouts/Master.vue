<template>
    <div class="master-layout">
        <div class="menu">
            <Logo></Logo>
            <Menu></Menu>
        </div>
        <main class="main-layout">
            <header class="header"></header>
            <main class="main">
                <router-view></router-view>
            </main>
        </main>

        <Search v-if="pageSearch.isOpen"></Search>
    </div>
</template>

<script setup>
import Menu from './Menu.vue'
import Logo from './Logo.vue'
import Search from './Search.vue'
import { store } from '@/store'
import { computed } from 'vue'

const pageSearch = computed({
    get: () => store.pageSearch,
    set: (value) => {
        store.pageSearch = value
    },
})
</script>