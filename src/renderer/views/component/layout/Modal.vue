<template>
    <transition name="modal-animation">
        <div v-show="show" class="custom-modal" :style="{'z-index': index}" id="custom-modal">
            <div class="content-modal">
                <transition name="modal-animation-inner">
                    <div class="bg-white inner-modal" :class="!maxWidth || maxWidth == '' ? 'max-w-3xl' : maxWidth" :id="modal_panel_id">
                        <div class="text-black header-modal" :id="modal_header_id">
                            <div scope="col" colspan="6" class="">
                                {{ title }}
                            </div>
                            <button @click="onClose()" type="button" class="close-modal">
                                &#10005;
                            </button>
                        </div>

                        <div style="max-height: calc(100vh - 5rem); overflow-y: auto;">
                            <slot></slot>
                        </div>
                    </div>
                </transition>
            </div>
        </div>
    </transition>
</template>
<style lang="css" scoped>

.custom-modal{
  position: fixed;
  inset: 0;
  overflow-y: auto;
}
.content-modal{
  min-height: 100%;
  padding: 1rem;
  text-align: center;
}
.inner-modal{
  width: 100%;
  text-align: left;
  border: 2px solid var(--color-gray-border);
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
.header-modal{
  padding: 0.5rem;
  background-color: var(--theme-color);
  color: white;
  font-weight: 300;
  font-size: 16px;
  position: relative;
  cursor: move;
  display: flex;
  justify-content: space-between;
}
.close-modal{
  padding: 0 0.25rem;
  border: none;
  border-radius: 0.5rem;
  display: inline-flex;
  align-items: center;
  background: transparent;
  color: #FFF;
  outline: none;
}
.close-modal-icon{
  width: 1.25rem;
  height: 1.25rem;
}

.content-modal {
    background: #000000b3;
}
.modal-animation-enter-active,
.modal-animation-leave-active {
  transition: opacity 0.3s cubic-bezier(0.52, 0.02, 0.19, 1.02);
}

.modal-animation-enter-from,
.modal-animation-leave-to {
  opacity: 0;
}

.modal-animation-inner-enter-active {
  transition: all 0.3s cubic-bezier(0.52, 0.02, 0.19, 1.02) 0.15s;
}

.modal-animation-inner-leave-active {
  transition: all 0.3s cubic-bezier(0.52, 0.02, 0.19, 1.02);
}

.modal-animation-inner-enter-from {
  opacity: 0;
  transform: scale(0.8);
}

.modal-animation-inner-leave-to {
  transform: scale(0.8);
}

.modal {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  width: 100vw;
  position: fixed;
  top: 0;
  left: 0;
  background-color: rgba(255, 255, 255, 0.7);
}
</style>
<script setup>
import { computed, ref, onUpdated, onMounted, onBeforeMount, onUnmounted } from 'vue'
import { useStore } from "@/store"
// uses
const store = useStore()

// props
const props = defineProps(['show', 'title', 'maxWidth', 'class'])

// emits
const emit = defineEmits(['close'])

// data
const index = ref(0)
const modal_panel_id = ref((Math.random() + 1).toString(36).substring(3))
const modal_header_id = ref((Math.random() + 1).toString(36).substring(3))
const stateIndex = computed(() => store.numberModal)

// functions
const onClose = () => {
    emit('close')
}

const dragElement = (element, header) => {
    var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    try {
        header.onmousedown = dragMouseDown;
    } catch (error) {
        return;
    }
    let elHeight = element.offsetHeight;
    let elWidth = element.offsetWidth;
    let screenHeight = document.getElementById('custom-modal').offsetHeight;
    let screenWidth = document.getElementById('custom-modal').offsetWidth;

    let minTop = elHeight / 2;
    let maxTop = (screenHeight - elHeight) + (elHeight / 2);
    let minLeft = elWidth / 2;
    let maxLeft = (screenWidth - elWidth) + (elWidth / 2);

    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        // get the mouse cursor position at startup:
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        // call a function whenever the cursor moves:
        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        // calculate the new cursor position:
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        // set the element's new position:

        if((element.offsetTop - pos2) > maxTop) {
            element.style.top = maxTop + "px";
        } else if((element.offsetTop - pos2) < minTop) {
            element.style.top = minTop + "px";
        } else {
            element.style.top = (element.offsetTop - pos2) + "px";
        }

        if((element.offsetLeft - pos1) > maxLeft) {
            element.style.left = maxLeft + "px";
        } else if((element.offsetLeft - pos1) < minLeft) {
            element.style.left = minLeft + "px";
        } else {
            element.style.left = (element.offsetLeft - pos1) + "px";
        }
    }

    function closeDragElement() {
        /* stop moving when mouse button is released:*/
        document.onmouseup = null;
        document.onmousemove = null;
    }
}

const setElement = () => {
    setTimeout((callback = dragElement) => {
        let modalPanel = document.getElementById(modal_panel_id.value);
        let modalHeader = document.getElementById(modal_header_id.value);
        callback(modalPanel, modalHeader)
    }, 500);
}

// lifecycle
onBeforeMount(() => {
    store.addIndex()
    index.value = stateIndex.value
})
onMounted(() => {
    setElement()
})
onUpdated(() => {
    setElement()
}, {slots: true})
onUnmounted(() => {
    store.subIndex()
})
</script>

