<template>
    <form class="gap-3 p-2 wrapper-scroll" @submit.prevent="onVRP()">
        <fieldset class="w-full form-input required box" style="max-height: 15rem;">
            <legend>Số lượng xe</legend>
            <div class="wrapper-scroll">
                <div class="flex justify-end gap-3">
                    <button type="button" class="btn green w-[6rem]" @click="addItem()">{{ $t('button.add_item') }}</button>
                    <button type="button" class="btn silver w-[6rem]" @click="reset()">{{ $t('button.reset') }}</button>
                </div>
                <div class="flex gap-3 box-bottom">
                    <div class="w-[3rem] justify-center items-end flex">
                        <div class="w-[1rem]"></div>
                        <span class="w-[2rem] text-end text-sm">
                            {{ vehicles.length ? vehicles.length : '' }}
                        </span>
                    </div>
                    <fieldset class="w-[20%] form-input required">
                        <legend>{{ 'Biển số' }}</legend>
                    </fieldset>
                    <fieldset class="w-[40%] form-input required">
                        <legend>{{ 'Doanh số' }}{{ `(${format_number(totalVehicleCapacity())})` }}</legend>
                    </fieldset>
                </div>
                <div class="parent-scroll">
                    <div class="w-full">
                        <template v-for="(vehicle, index) in vehicles">
                            <div class="flex gap-3">
                                <div class="flex items-center text-sm w-[3rem] gap-1" style="margin-bottom: -3px;">
                                    <div class="w-[1rem]">
                                        <span class="close-item" v-if="vehicles.length > 1" @click="deleteItem(index)">✕</span>
                                    </div>
                                    <span class="w-[2rem] text-end">
                                        {{ index + 1 }}
                                    </span>
                                </div>
                                <fieldset class="w-[20%] form-input required">
                                    <input type="text" class="w-full text-center form-control" required v-model="vehicle.VehicleCode">
                                </fieldset>
                                <fieldset class="w-[20%] form-input required">
                                    <input type="number" class="w-full text-right form-control" required v-model="vehicle.VehicleCapacity" min="0">
                                </fieldset>
                            </div>
                        </template>
                    </div>
                </div>
            </div>
        </fieldset>

        <fieldset class="w-full form-input required box parent-scroll" style="height: 98%;">
            <legend>Danh sách đại lý</legend>
            <div class="gap-2 wrapper-scroll">
                <div class="flex items-end justify-between gap-3">
                    <fieldset class="w-[40%] form-input required">
                        <legend>{{ "Vị trí kho" }}</legend>
                        <select2 class="form-control" required :options="agentList" v-model="warehouse" label="AgentNameLabel" :reduce="item => item.AgentCode">
                            <template #search="{ attributes, events }">
                                <input class="vs__search" :required="warehouse == null || warehouse == ''" v-bind="attributes" v-on="events" />
                            </template>
                        </select2>
                    </fieldset>
                    <div class="flex justify-end gap-3">
                        <button type="button" class="btn green w-[6rem]" @click="addItemAgent()">{{ $t('button.add_item') }}</button>
                        <input id="file" ref="file" type="file" @change="onFileChange($event)" class="hidden">
                        <button type="button" class="btn silver w-[6rem]" @click="openFile()">{{ $t('button.import') }}</button>
                        <button type="button" class="btn silver w-[6rem]" @click="resetAgent()">{{ $t('button.reset') }}</button>
                    </div>
                </div>
                <div class="flex gap-3 box-bottom">
                    <div class="w-[3rem] justify-center items-end flex">
                        <div class="w-[1rem]"></div>
                        <span class="w-[2rem] text-end text-sm">
                            {{ agents.length ? agents.length : '' }}
                        </span>
                    </div>
                    <fieldset class="w-[40%] form-input required">
                        <legend>{{ 'Đại lý' }}</legend>
                    </fieldset>
                    <fieldset class="w-[20%] form-input required flex items-center">
                        <legend>{{ 'Doanh số ' }}{{ `(${format_number(totalDelivery())})` }}</legend>
                    </fieldset>
                    <fieldset class="w-[25%] form-input">
                        <legend>{{ 'Chuyển cho xe' }}</legend>
                    </fieldset>
                </div>
                <div class="parent-scroll">
                    <div class="w-full view-scroll">
                        <template v-for="(agent, index) in agents">
                            <div class="flex gap-3">
                                <div class="flex items-center text-sm w-[3rem] gap-1" style="margin-bottom: -3px;">
                                    <div class="w-[1rem]">
                                        <span class="close-item" @click="deleteItemAgent(index)" v-if="agents.length > 1">✕</span>
                                    </div>
                                    <span class="w-[2rem] text-end">
                                        {{ index + 1 }}
                                    </span>
                                </div>
                                <fieldset class="w-[40%] form-input required">
                                    <select2 class="form-control" required :options="agentList"
                                        v-model="agent.AgentCode" label="AgentNameLabel"
                                        :reduce="item => item.AgentCode">
                                        <template #search="{ attributes, events }">
                                            <input class="vs__search"
                                                :required="agent.AgentCode == null || agent.AgentCode == ''"
                                                v-bind="attributes" v-on="events" />
                                        </template>
                                    </select2>
                                </fieldset>
                                <fieldset class="w-[20%] form-input required">
                                    <input type="number" class="w-full text-right form-control" required
                                        v-model="agent.AgentDelivery" min="0">
                                </fieldset>
                                <fieldset class="w-[15%] form-input required">
                                    <input type="text" class="w-full text-right form-control"
                                        v-model="agent.AgentSkill">
                                </fieldset>
                            </div>
                        </template>
                    </div>
                </div>
            </div>
        </fieldset>

        <div class="flex justify-around w-full">
            <button type="submit" class="btn w-[6rem]" :disabled="vehicles.length <= 0 || agents.length <= 0">{{ "Vẽ tuyến" }}</button>
        </div>
    </form>

    <VRPResult v-if="showVRP" :show="showVRP" :data="vrpProp" @close="onCloseVRP($event)" @save="onSaveVRP($event)" />

    <Confirm ref="confirm"></Confirm>
</template>
<script setup>
import { onMounted, ref, watch, computed } from 'vue'
import { t } from '@/i18n'
import { agentStore } from '@/store/agent';
import { vrpStore } from '@/store/vrp';
import VRPResult from './VRPResult.vue'

const showVRP = ref(false)
const confirm = ref(null)
const reload = ref(false)
const file = ref(null)
const agentList = computed(() => agentStore.agentList)

const vehicles = computed(() => vrpStore.vehicles)
const agents = computed(() => vrpStore.agents)
const warehouse = ref(null)
const vrpProp = ref({
    vehicles: [],
    jobs: [],
    warehouse: []
})


const addItem = () => {
    vrpStore.add()
}

const deleteItem = (index) => {
    vrpStore.delete(index)
}

const reset = () => {
    vrpStore.reset()
}

const totalDelivery = () => {
    return agents.value.reduce((sum, item) => sum + item.AgentDelivery, 0)
}

const totalVehicleCapacity = () => {
    return vehicles.value.reduce((sum, item) => sum + item.VehicleCapacity, 0)
}

/**
 * list agent
 */
const addItemAgent = () => {
    vrpStore.addAgent()
}

const deleteItemAgent = (index) => {
    vrpStore.deleteAgent(index)
}

const resetAgent = () => {
    vrpStore.resetAgent()
}

const openFile = () => {
    file.value.value = null
    file.value.click()
}

const setAgents = (data) => {
    vrpStore.resetAgent()
    for (const i in data) {
        let agent = { ...vrpStore.initAgent }

        if (data[i].AgentCode) {
            agent.AgentCode = data[i].AgentCode
        }
        if (data[i].AgentDelivery) {
            agent.AgentDelivery = data[i].AgentDelivery
        }

        vrpStore.setAgent(agent)
    }
}

const onFileChange = async (e) => {
    let file = e.target.files ? e.target.files[0] : null
    if (file) {
        let formData = new FormData();
        formData.append('file', file);
        await vrpStore.import(formData).then((res) => {
            if (res && res.code == 200) {
                setAgents(res.data)
            }
        })
    }
}

/**
 * Handle
 */
const getAgentList = async () => {
    await agentStore.list().then((res) => {
        if (res && res.code == 200) {
            agentStore.setAgentList(res.data.items)
        }
    })
}

const onVRP = () => {
    if (totalVehicleCapacity() < totalDelivery()) {
        return confirm.value.show({
            title: t("title.error"),
            message: `Tổng doanh số trên các xe phải lớn hơn tổng doanh số ở đại lý mới có thể vận tải được.`,
            type: 3
        })
    }
    vrpProp.value.vehicles = getVehicles()
    vrpProp.value.jobs = getJobs()
    vrpProp.value.warehouse = getWarehouse()
    console.log(vrpProp.value)

    showVRP.value = true
}

const onCloseVRP = (event) => {
    showVRP.value = false
    if (event) {
        // index()
    }
}
const onSaveVRP = (event) => {
    showVRP.value = false
    if (event) {
        // index()
    }
}

const getWarehouse = () => {
    let wh = agentList.value.find(i => i.AgentCode == warehouse.value)
    if (wh) {
        return [wh.AgentLocationX, wh.AgentLocationY]
    }
    return []
}

const getVehicles = () => {

    return vehicles.value.map((item, index) => {
        return {
            "id": index,
            "capacity": [item.VehicleCapacity],
            "start": getWarehouse(),
            "code": item.VehicleCode
        }
    })
}

const getJobs = () => {
    return agents.value.map((item, index) => {
        let agent = agentList.value.find(i => i.AgentCode == item.AgentCode)
        // console.log(agent)
        let skills = []
        let skill = null
        if (item.AgentSkill) {
            skill = vehicles.value.findIndex(veh => veh.VehicleCode == item.AgentSkill);
        }

        if (skill) {
            skills.push(skill)
        }

        return {
            "id": index,
            "name": `${agent.AgentNameLabel}`,
            "location": [agent.AgentLocationX, agent.AgentLocationY],
            "code": item.AgentCode,
            "delivery": [item.AgentDelivery],
            "skills": skills,
        }
    })
}

onMounted(async () => {
    await getAgentList()
})

</script>