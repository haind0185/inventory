<script setup>
import { ref, onMounted, watch } from "vue";
import StickyNote from "./StickyNote.vue";

const notes = ref([]);
const highestZIndex = ref(1); // Theo dõi z-index cao nhất

// Lấy dữ liệu từ localStorage
onMounted(() => {
    const savedNotes = JSON.parse(localStorage.getItem("stickyNotes")) || [];
    notes.value = savedNotes.map(note => ({
        ...note,
        width: note.width || 200,
        height: note.height || 150,
        zIndex: note.zIndex || 1 // Đảm bảo có zIndex
    }));

    // Xác định z-index cao nhất khi khởi động
    highestZIndex.value = Math.max(1, ...notes.value.map(n => n.zIndex || 1));
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
    highestZIndex.value++; // Ghi chú mới sẽ có z-index cao nhất
    notes.value.push({
        id: Date.now(),
        title: "Ghi chú",
        text: "",
        x: Math.floor(Math.random() * (60 - 50 + 1)) + 50,
        y: Math.floor(Math.random() * (100 - 50 + 1)) + 90,
        width: 250,
        height: 350,
        color: getRandomColor(),
        zIndex: highestZIndex.value,
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

// Khi focus vào một note, đặt nó lên trên cùng
const bringToFront = (id) => {
    highestZIndex.value++;
    const note = notes.value.find(n => n.id === id);
    if (note) {
        note.zIndex = highestZIndex.value;
    }
};

// Hàm lấy màu ngẫu nhiên
const getRandomColor = () => {
    // const colors = ["#FFEB3B", "#FFC107", "#FF9800", "#FF5722", "#4CAF50", "#2196F3", "#9C27B0"];
    const colors = ["#ffdb34"];
    return colors[Math.floor(Math.random() * colors.length)];
};
</script>

<template>
    <div class="app">
        <button class="add-btn" @click="addNote">+ Thêm ghi chú</button>
        
        <StickyNote v-for="note in notes"
        :key="note.id"
        :note="note"
        :onDelete="deleteNote"
        :onUpdate="updateNote"
        :onFocus="bringToFront"
        />
    </div>
</template>

<style>
.app {
    position: relative;
    width: 100%;
    height: 100%;
    background-color: #f0f0f0;
    overflow: auto;
}

.add-btn {
    position: absolute;
    top: 10px;
    left: 10px;
    padding: 10px 10px;
    background: #007bff;
    color: white;
    border: none;
    cursor: pointer;
    border-radius: 5px;
}
</style>
