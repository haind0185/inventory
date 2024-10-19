<template>
    <div class="progress-bar">
        <div class="fill" :style="{width: value+'%', 'background-color': bg}"></div>
        <span>{{ `${value}%` }}</span>
    </div>
</template>

<style>
.progress-bar {
    width: 100%;
    background-color: #e0e0e0;
    border-radius: 4px;
    overflow: hidden;
    margin: 0px 0;
    position: relative;
}

.fill {
    height: 16px;
    width: 0;
    transition: width 0.3s ease;
    position: relative;
}

.progress-bar span {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    color: black;
    font-size: 12px;
}
</style>

<script setup>
import { ref, watch, onMounted, toRefs } from 'vue'
const props = defineProps(['value'])
const { value } = toRefs(props);
const bg = ref('#e0e0e0')

const setBg = () => {
    if(value.value < 20) {
        bg.value = '#ff4d4d';
    }
    if(value.value >= 20 && value.value < 50) {
        bg.value = '#ffcc00';
    }
    if(value.value >= 50) {
        bg.value = '#4caf50';
    }
}

onMounted(() => {
    setBg()
})

watch(
    value,
    () => {
        setBg()
    }
)
</script>