<script setup>
import { ref, onMounted, watch } from "vue";
import StickyNote from "./StickyNote.vue";

const notes = ref([]);

// Lấy dữ liệu từ localStorage
onMounted(() => {
    const savedNotes = JSON.parse(localStorage.getItem("stickyNotes")) || [];
    notes.value = savedNotes.map(note => ({
        ...note,
        width: note.width || 200, // Giá trị mặc định
        height: note.height || 150
    }));
});

// Lưu vào localStorage khi notes thay đổi
watch(
    notes,
    (newNotes) => {
        localStorage.setItem("stickyNotes", JSON.stringify(newNotes));
    },
    { deep: true }
);

// Thêm một ghi chú mới
const addNote = () => {
    notes.value.push({
        id: Date.now(),
        text: "New Note",
        x: 100,
        y: 100,
        width: 200,
        height: 150,
        color: getRandomColor(),
    });
};

// Xóa ghi chú
const deleteNote = (id) => {
    notes.value = notes.value.filter((note) => note.id !== id);
};

// Cập nhật ghi chú
const updateNote = (updatedNote) => {
    const index = notes.value.findIndex((note) => note.id === updatedNote.id);
    if (index !== -1) {
        notes.value[index] = { ...updatedNote };
    }
};

// Hàm lấy màu ngẫu nhiên
const getRandomColor = () => {
    const colors = ["#FFEB3B", "#FFC107", "#FF9800", "#FF5722", "#4CAF50", "#2196F3", "#9C27B0"];
    return colors[Math.floor(Math.random() * colors.length)];
};
</script>

<template>
    <div class="app">
        <button class="add-btn" @click="addNote">➕ Thêm Ghi Chú</button>
        <StickyNote v-for="note in notes" :key="note.id" :note="note" :onDelete="deleteNote" :onUpdate="updateNote" />
    </div>
</template>

<style>
.app {
    position: relative;
    width: 100vw;
    height: 100vh;
    background-color: #f0f0f0;
    overflow: hidden;
}

.add-btn {
    position: absolute;
    top: 10px;
    left: 10px;
    padding: 10px 15px;
    background: #007bff;
    color: white;
    border: none;
    cursor: pointer;
    border-radius: 5px;
}
</style>
