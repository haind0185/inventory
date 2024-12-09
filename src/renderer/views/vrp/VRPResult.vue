<template>
    <Modal :show="show" :title="'Bản đồ phân phối tuyến xe'" maxWidth="max-w-7xl" @close="onClose()" class="">
        <div class="flex gap-4 p-2">
            <label class="flex items-center gap-1 text-sm">
                <input type="checkbox" v-model="isShowVehicle" @click="isShowVehicle = !isShowVehicle; drawMap()">
                Hiển thị xe
            </label>
            <label class="flex items-center gap-1 text-sm">
                <input type="checkbox" v-model="isShowAgent" @click="isShowAgent = !isShowAgent; drawMap()">
                Hiển thị đại lý
            </label>
        </div>
        <div class="w-full h-full" style="height: calc(100vh - 8rem);" id="map-container" >
            <div id="map" style="height: 100%; width: 100%;"></div>
        </div>
    </Modal>

    <Confirm ref="confirm"></Confirm>
</template>

<style>

</style>

<script setup>
import { onMounted, ref, watch } from 'vue'
import { t } from '@/i18n'
import L from 'leaflet';
import PolylineUtil from 'polyline-encoded'

const { show, data } = defineProps(['show', 'data'])
const emit = defineEmits(['close', 'save'])
console.log(data)

const colors = ['E74C3C', 'A1BC9C', 'E4495E', 'B4595E', 'E8495E', 'F39C12', 'E498DB', 'E2CC71', 'B959B6'];
const isShowVehicle = ref(false)
const isShowAgent = ref(false)
const routes = ref([])
const unassigned = ref([])
const onClose = () => {
    emit('close')
}
let map = null

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
            routes.value = result.routes
            unassigned.value = result.unassigned
            drawMap()
        })
        .catch(error => console.error('Error:', error));
}

const initMap = () => {
    const container = document.createElement("div");
    container.id = "map";
    container.style.height = "100%";
    container.style.width = "100%";

    const parent = document.getElementById("map-container");
    parent.innerHTML = "";
    parent.appendChild(container);
}

const drawMap = () => {
    initMap()
    if (map) {
        map.remove()
    }
    map = L.map("map")

    map.setView([data.warehouse[1], data.warehouse[0]], 11);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    L.marker([data.warehouse[1], data.warehouse[0]], { icon: getMaker('black') }).addTo(map).bindTooltip(`<b>Kho</b>`, { permanent: false, direction: "top" });

    // Vẽ lên bản đồ
    routes.value.forEach((route, index) => {
        let color = colors[index] ?? colors[0]

        // Bước 1: Vẽ tuyến đường cho từng xe (Vehicle)
        let vehicle = data.vehicles.find(item => item.id == route.vehicle)
        if(vehicle) {
            L.polyline(PolylineUtil.decode(route.geometry), { color: geometryColor(color) }).addTo(map).bindTooltip(`<b>Xe: ${vehicle.code}</b>`, { permanent: isShowVehicle.value, direction: "top" });;
        }

        // Bước 2: Thêm maker Agent vào bản đồ
        route.steps.forEach((job, index) => {
            if(job.type == 'job') {
                let agent = data.jobs.find(item => item.id == job.id)
                if(agent) {
                    L.marker([agent.location[1], agent.location[0]], { icon: getMaker(color) }).addTo(map).bindTooltip(`<b>${agent.name}(${agent.delivery[0]})</b>`, { permanent: isShowAgent.value, direction: "top" });
                }
            }
        })
    })

    // Vẽ những đại lý không được giao
    unassigned.value.forEach((job, index) => {
        let agent = data.jobs.find(item => item.id == job.id)
        if(agent) {
            L.marker([agent.location[1], agent.location[0]], { icon: getMaker('red') }).addTo(map).bindTooltip(`<b>${agent.name}(${agent.delivery[0]})</b>`, { permanent: isShowAgent.value, direction: "top" });
        }
    })
}

const geometryColor = (color) => {
    return `#${color}`;
}

const getMaker = (color) => {
    return L.divIcon({
        className: 'custom-marker',
        html: `<div class="marker ${color}"></div>`,
        iconSize: [20, 20]
    });
}

onMounted(async () => {
    await calculate()
})


</script>