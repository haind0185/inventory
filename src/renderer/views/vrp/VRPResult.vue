<template>
    <Modal :show="show" :title="'Bản đồ phân phối tuyến xe'" maxWidth="max-w-7xl" @close="onClose()" class="">
        <div class="w-full h-full" style="height: calc(100vh - 8rem);">
            <div id="map" style="height: 100%; width: 100%;"></div>
        </div>
    </Modal>

    <Confirm ref="confirm"></Confirm>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue'
import { t } from '@/i18n'
import L from 'leaflet';
import PolylineUtil from 'polyline-encoded'

const { show, data } = defineProps(['show', 'data'])
const emit = defineEmits(['close', 'save'])

const onClose = () => {
    emit('close')
}

console.log(data)

const calculate = async () => {
    const vroomData = {
        "vehicles": data.vehicles,
        "jobs": data.jobs,
    };


    // Phân phối kết quả
    await fetch('http://solver.vroom-project.org/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(vroomData),
    }).then(response => response.json())
        .then(result => {
            let geometries = result.routes.map(item => {
                return item.geometry
            })
            drawMap(geometries)
        })
        .catch(error => console.error('Error:', error));
};

const drawMap = (geometries) => {
    // Khởi tạo bản đồ
    const map = L.map("map").setView(data.warehouse, 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    
    // Thêm điểm vào bản đồ
    // Kho
    L.marker(data.warehouse).addTo(map).bindTooltip(`<b>Kho</b>`, { permanent: false, direction: "top" });
    // Đại lý
    data.jobs.forEach((loc) => {
        console.log(loc)
        L.marker([loc.location[1], loc.location[0]]).addTo(map).bindTooltip(`<b>${loc.name}(${loc.delivery[0]})</b>`, { permanent: false, direction: "top" });
    });
    
    // Vẽ tuyến đường cho từng xe
    const colors = ['blue', 'red', 'green', 'black']
    geometries.forEach((geometry, index) => {
        var latlngs = PolylineUtil.decode(geometry); // Giải mã polyline thành các điểm
        let color = colors[index]
        L.polyline(latlngs, { color: color }).addTo(map);
    })
}

onMounted(async () => {
    await calculate()
})

</script>