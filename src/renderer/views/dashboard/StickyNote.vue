<script setup>
import { ref, watch } from "vue";

const props = defineProps(["note", "onDelete", "onUpdate", "onFocus"]);

const note = ref({ ...props.note });
const dragging = ref(false);
const resizing = ref(false);
const offsetX = ref(0);
const offsetY = ref(0);
const startWidth = ref(0);
const startHeight = ref(0);
const isEditing = ref(false); // Theo dõi trạng thái chỉnh sửa tên
const newHeaderText = ref(note.value.title); // Lưu tên header mới khi chỉnh sửa

// Khi focus vào note, đặt nó lên trên
const focusNote = () => {
    props.onFocus(note.value.id);
};

// Bắt đầu kéo
const startDrag = (event) => {
    dragging.value = true;
    offsetX.value = event.clientX - note.value.x;
    offsetY.value = event.clientY - note.value.y;
    document.addEventListener("mousemove", drag);
    document.addEventListener("mouseup", stopDrag);
};

// Xử lý kéo
const drag = (event) => {
    if (!dragging.value) return;
    note.value.x = Math.max(0, event.clientX - offsetX.value);
    note.value.y = Math.max(0, event.clientY - offsetY.value);
};

// Dừng kéo
const stopDrag = () => {
    dragging.value = false;
    document.removeEventListener("mousemove", drag);
    document.removeEventListener("mouseup", stopDrag);
    props.onUpdate(note.value);
};

// Bắt đầu resize
const startResize = (event) => {
    resizing.value = true;
    startWidth.value = note.value.width;
    startHeight.value = note.value.height;
    offsetX.value = event.clientX;
    offsetY.value = event.clientY;
    document.addEventListener("mousemove", resize);
    document.addEventListener("mouseup", stopResize);
};

// Xử lý resize
const resize = (event) => {
    if (!resizing.value) return;
    const newWidth = startWidth.value + (event.clientX - offsetX.value);
    const newHeight = startHeight.value + (event.clientY - offsetY.value);
    note.value.width = Math.max(newWidth, 100);
    note.value.height = Math.max(newHeight, 100);
};

// Dừng resize
const stopResize = () => {
    resizing.value = false;
    document.removeEventListener("mousemove", resize);
    document.removeEventListener("mouseup", stopResize);
    props.onUpdate(note.value);
};

// Kích hoạt chế độ chỉnh sửa tên
const enableEditing = () => {
    isEditing.value = true;
    newHeaderText.value = note.value.title; // Gán lại tên header ban đầu
};

// Khi chỉnh sửa xong, lưu tên mới
const saveHeader = () => {
    note.value.title = newHeaderText.value; // Lưu vào title, không phải text
    isEditing.value = false; // Tắt chế độ chỉnh sửa
    props.onUpdate(note.value); // Cập nhật note lên App.vue
};

// Theo dõi thay đổi để cập nhật vào localStorage
watch(
    () => note.value,
    (newVal) => {
        props.onUpdate(newVal);
    },
    { deep: true }
);
watch(
    () => props.note,
    (newNote) => {
        note.value.title = newNote.title; // Dùng title thay vì text
        note.value.zIndex = newNote.zIndex; // Quan trọng: cập nhật z-index
    },
    { deep: true }
);
</script>

<template>
    <div class="sticky-note" :style="{
        top: note.y + 'px',
        left: note.x + 'px',
        width: note.width + 'px',
        height: note.height + 'px',
        backgroundColor: note.color,
        zIndex: note.zIndex
    }" @mousedown="focusNote" @dblclick="enableEditing">
        <!-- Header để kéo -->
        <div class="note-header" @mousedown="startDrag" @dblclick="enableEditing">
            <span>📌</span>
            <span v-if="!isEditing">{{ note.title }}</span>
            <input
                v-if="isEditing"
                v-model="newHeaderText"
                @blur="saveHeader"
                @keyup.enter="saveHeader"
                class="header-input"
                autofocus
            />
            <button class="delete-btn" @click="onDelete(note.id)">❌</button>
        </div>

        <!-- Nội dung -->
        <textarea v-model="note.text" class="note-content" placeholder="Type ..."></textarea>

        <!-- Góc kéo để resize -->
        <div class="resize-handle" @mousedown="startResize"></div>
    </div>
</template>

<style scoped>
.sticky-note {
    position: absolute;
    min-width: 100px;
    min-height: 100px;
    box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.2);
    border-radius: 10px;
    overflow: hidden;
}

/* Header để kéo */
.note-header {
    background: rgba(0, 0, 0, 0.3);
    padding: 5px;
    font-size: 16px;
    font-weight: bold;
    cursor: grab;
    display: flex;
    justify-content: space-between;
    align-items: center;
    user-select: none;
}

/* Xóa nút */
.delete-btn {
    background: transparent;
    color: white;
    border: none;
    cursor: pointer;
    border-radius: 50%;
    width: 20px;
    height: 20px;
    font-size: 12px;
}

/* Nội dung */
.sticky-note textarea {
    width: 100%;
    height: calc(100% - 30px);
    border: none;
    background: transparent;
    resize: none;
    outline: none;
    font-size: 17px;
    font-weight: 500;
    padding: 5px;
}

/* Input chỉnh sửa tên */
.header-input {
    width: 100%;
    background-color: transparent;
    border: none;
    color: white;
    font-size: 16px;
    font-weight: bold;
    padding: 2px;
    outline: none;
    text-align: center;
    border: 1px solid #ccc;
    border-radius: 5px;
}

/* Góc kéo để resize */
.resize-handle {
    width: 10px;
    height: 10px;
    background: rgba(0, 0, 0, 0.3);
    position: absolute;
    bottom: 0;
    right: 0;
    cursor: nwse-resize;
}
</style>
