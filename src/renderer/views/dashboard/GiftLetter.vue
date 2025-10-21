<template>
    <div class="pocket-container" v-if="isShow">
        <div class="pocket">
            <div class="envelope" @click="onOpenLetter()">
                <div class="flap-bottom"></div>
                <div class="flap-left"></div>
                <div class="flap-right"></div>
                <div class="flap-top-in" :class="{'open': isOpen}"></div>
                <div class="flap-top" :class="{'open': isOpen}"></div>
                <div class="letter" :class="{ open: isOpen }">
                    <p><strong>To: Crush</strong></p>
                    <p>My world stops.</p>
                </div>
            </div>
        </div>

        <button class="close-letter" @click="isShow = false">❌</button>
    </div>
</template>
<script setup>
import { ref, onMounted, watch, computed } from "vue"
import { serviceSendMessage } from "@/service.js"
import moment from 'moment'

const isShow = ref(false)
const isOpen = ref(false)
const onOpenLetter = () => {
    if(!isOpen.value) {
        isOpen.value = true
        const firstSendNotify = localStorage.getItem("firstSendNotify") || false
        if(!firstSendNotify) {
            serviceSendMessage("Đã nhận được thư!")
            localStorage.setItem("firstSendNotify", true)
        }
    } else {
        isOpen.value = false
    }
}

onMounted(async () => {
    const dateToCheck = moment()
    const dateArray = ["2025-03-08", "2025-03-09", "2025-03-10"]
    const isInArray = dateArray.some(date => moment(date).format("YYYY-MM-DD") === dateToCheck.format("YYYY-MM-DD"))
    if(isInArray) {
        isShow.value =  true
    }
})
</script>

<style>
.pocket-container {
    position: absolute;
    width: 100%;
    height: 100%;
    z-index: 996;
}

.pocket {
    width: 100%;
    height: 100%;
    background-color: #e8dff5;
    font-family: Arial, sans-serif;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 996;
}

.envelope {
    position: relative;
    width: 500px;
    height: 300px;
    background-color: #F59998;
    cursor: pointer;
    z-index: 996;
}

.flap-bottom {
    position: absolute;
    bottom: 0;
    width: 0;
    height: 0;
    border-left: 250px solid transparent;
    border-right: 250px solid transparent;
    border-bottom: 150px solid #FF6258;
    transition: transform 0.5s ease;
    z-index: 999;
}

.flap-left {
    position: absolute;
    bottom: 0;
    width: 0;
    height: 0;
    border-top: 150px solid transparent;
    border-bottom: 150px solid transparent;
    border-left: 250px solid #F59998;
    transition: transform 0.5s ease;
    z-index: 998;
}

.flap-right {
    position: absolute;
    bottom: 0;
    right: 0;
    width: 0;
    height: 0;
    border-top: 150px solid transparent;
    border-bottom: 150px solid transparent;
    border-right: 250px solid #F59998;
    transition: transform 0.5s ease;
    z-index: 998;
}


.flap-top-in {
    position: absolute;
    top: 0;
    width: 0;
    height: 0;
    border-left: 250px solid transparent;
    border-right: 250px solid transparent;
    border-top: 160px solid #D74A4A;
    transition: transform 0.5s ease;
    z-index: 999;
}
.flap-top-in.open {
    border-top: 150px solid #D74A4A;
    z-index: 996;
}
.flap-top {
    position: absolute;
    top: 0;
    width: 0;
    height: 0;
    border-left: 250px solid transparent;
    border-right: 250px solid transparent;
    border-top: 160px solid #D74A4A;
    transition: transform 1s ease;
    display: none;
    z-index: 996;
}

.flap-top.open {
    display: block;
    transform: rotateX(180deg);
    top: -160px;
}

.letter {
    position: absolute;
    width: calc(100% - 10px);
    height: calc(100% - 10px);
    left: 5px;
    background-color: white;
    padding: 10px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
    transform: translateY(5px);
    transition: transform 1s ease;
    z-index: 996;
    opacity: 0;
    visibility: hidden;
}

.letter.open {
    transform: translateY(-50%);
    opacity: 1;
    visibility: visible;
    z-index: 997;
}

.close-letter {
    position: absolute;
    top: 4px;
    right: 4px;
}
</style>