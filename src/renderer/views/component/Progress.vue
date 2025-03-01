<template>
    <div class="progress-container">
        <div class="progress-bar">
            <div class="progressing" :style="{'width': progress.value+'%'}"></div>
        </div>
        <div class="progressing-text">{{ `${progress.value}%` }}</div>
    </div>
</template>

<script setup>
import { onMounted, onBeforeMount, computed, watch, ref } from 'vue'
import { store } from '@/store'

const progress = computed(() => store.progress)

</script>

<style scoped>
.progress-container {
    position: fixed;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    background: black;
    opacity: 0.25;
    z-index: 1000;
}

.progress-container .progress-bar {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);

    width: 500px;
    height: 32px;
    background: #ddd;
    border-radius: 5px;
}

.progressing {
    width: 0%;
    height: 32px;
    border-radius: 5px;
    background: green;
    transition: width 0.5s;
}

.progressing-text {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
}
</style>