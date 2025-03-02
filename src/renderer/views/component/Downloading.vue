<template>
    <div v-if="isVisible" class="loading">
        <div class="progress-bar">
            <div class="progressing" :style="{ 'width': progress + '%' }">
            </div>
        </div>
        <div class="progress-bar-text">Downloading...</div>
    </div>
</template>

<script setup>
import { defineProps, watch, ref, onMounted } from 'vue';

const props = defineProps({
    isVisible: Boolean
});

const progress = ref(0);

function startProgress() {
    progress.value = 0;
    let interval = setInterval(() => {
        if (progress.value < 100) {
            progress.value += Math.random() * 10;
        } else {
            progress.value = 0
        }
    }, 50);
}
onMounted(() => {
    startProgress()
})
</script>

<style scoped>
.loading {
    position: fixed;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    background: black;
    opacity: 0.25;
    z-index: 9999;
}
.progress-bar {
    position: absolute;
    top: 1rem;
    left: 50%;
    transform: translate(-50%,-50%);

    width: 60%;
    height: 15px;
    background: gray;
}

.progressing {
    height: 15px;
    background: var(--bg-side-bar);
}

.progress-bar-text {
    position: absolute;
    top: 1rem;
    left: 50%;
    transform: translate(-50%,-50%);

    width: 60%;
    height: 23px;
    text-align: center;
    font-size: 14px;
}
</style>