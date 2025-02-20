<template>
    <div class="page-search-container" v-if="pageSearch.isOpen">
        <input type="text" class="form-control page-search"
            v-model="pageSearch.text"
            v-select-on-focus
            ref="pageSearchInput"
            @keyup.enter="onSearch()"
            >
        <span class="page-search-close" @click="closePageSearch()">❌</span>
    </div>
</template>

<script setup>
import { store } from '@/store'
import { computed, onMounted, ref } from 'vue';

const pageSearchInput = ref(null)

const pageSearch = computed({
    get: () => store.pageSearch,
    set: (value) => {
        store.pageSearch = value
    },
})

const closePageSearch = () => {
    pageSearch.value.isOpen = false
    window.electron.onClear()
}

const onSearch = async () => {
    await window.electron.onSearch(pageSearch.value.text)
}

onMounted(() => {
    if(pageSearchInput.value) {
        pageSearchInput.value.focus()
    }
})

</script>

<style scoped>
.page-search-container {
    position: fixed;
    top: 4px;
    right: 4px;
    width: 12rem;
    z-index: 9999;
}
.page-search {
    background: #e0e0e0;
    width: 100%;
}

.page-search-close {
    position: absolute;
    top: 50%;
    right: 4px;
    transform: translate(0, -50%);
    font-size: 10px;
    cursor: pointer;
}
</style>