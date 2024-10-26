<template>
    <div class="relative">
        <slot></slot>
        <div class="absolute">
            <span class="sort-icon" :class="{'active': search.sort_by == 'asc' && search.sort == field}" @click="submit('asc')">&uarr;</span>
            <span class="sort-icon" :class="{'active': search.sort_by == 'desc' && search.sort == field}" @click="submit('desc')">&darr;</span>
        </div>
    </div>
</template>
<script setup>
import { ref } from 'vue'

const { field, search } = defineProps(['field', 'search'])
const emit = defineEmits(['sort'])

const submit = (by) => {
    if(search.sort_by != by || search.sort != field) {
        search.sort_by = by
        search.sort = field
        emit('sort')
    }
}

</script>
<style scoped>
 .absolute {
    top: 0;
    right: 0;
    display: flex;
    gap: 4px;
    height: 100%;
    align-items: center;
 }
 .sort-icon {
    cursor: pointer;
    color: #9f9f9f;
 }
 .sort-icon.active {
    cursor: default;
    color: greenyellow;
 }
</style>