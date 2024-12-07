<template>
    <div>
        <button type="button" class="btn silver w-[6rem]" @click="calculate()">
            {{ 'test' }}
        </button>
    </div>
    <div id="map" style="height: 100%;"></div>
</template>
<style scoped>
#map {
    width: 100%;
    height: 500px;
}
</style>
<script setup>
// import { watch, ref, computed } from 'vue';
// import { store } from '@/store';
// import Loading from '@/views/component/Loading.vue';
// import * as turf from '@turf/turf';
import L from 'leaflet';
import PolylineUtil from 'polyline-encoded'

// Tọa độ đại lý và kho
const locations = [
    { id: 0, name: "Warehouse", location: [106.660172, 10.762622], "size": [0] }, // Kho
    { id: 1, name: "Agent 1", location: [106.665820, 10.776220], "size": [20] },
    { id: 2, name: "Agent 2", location: [106.679000, 10.761000], "size": [30] },
    { id: 3, name: "Agent 3", location: [106.678100, 10.762300], "size": [15] },
    { id: 4, name: "Agent 4", location: [106.670000, 10.765000], "size": [25] },
    { id: 5, name: "Agent 5", location: [106.680000, 10.773000], "size": [10] },
];

// Khởi tạo xe và sức chứa
const vehicles = [
    { "id": 1, "capacity": [50], "start": [106.660172, 10.762622], "end": [106.660172, 10.762622] },
    { "id": 2, "capacity": [50], "start": [106.660172, 10.762622], "end": [106.660172, 10.762622] }
];

const calculate = async () => {
    const vroomData = {
        "vehicles": vehicles,
        "jobs": locations.filter(item => item.id != 0),
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

// -----------------------------------map------------------------------
const drawMap = (geometries) => {
    // Khởi tạo bản đồ
    const map = L.map("map").setView([10.762622, 106.660172], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    
    // Thêm điểm vào bản đồ
    locations.forEach((loc) => {
        L.marker([loc.location[1], loc.location[0]]).addTo(map).bindTooltip(`<b>${loc.name}</b>`, { permanent: false, direction: "top" });
    });
    
    // Vẽ tuyến đường cho từng xe
    geometries.forEach(geometry => {
        var latlngs = PolylineUtil.decode(geometry); // Giải mã polyline thành các điểm
        L.polyline(latlngs, { color: 'blue' }).addTo(map);
    })
}

</script>
