<template>
    <div class="flex flex-col justify-between gap-3 p-2">
        <fieldset class="w-full form-input required box">
            <legend>Số lượng xe</legend>
            <div>
                <div>
                    <div class="flex justify-end gap-3">
                        <button type="button" class="btn green w-[6rem]" @click="addItem()">{{ $t('button.add_item') }}</button>
                        <button type="button" class="btn silver w-[6rem]" @click="reset()">{{ $t('button.reset') }}</button>
                    </div>
                </div>
                <div class="flex gap-3">
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
                        <legend>{{ 'Doanh số' }}</legend>
                    </fieldset>
                </div>
                <div class="flex-1" style="overflow: auto; border-top: 1px solid gray; border-bottom: 1px solid gray;">
                    <div class="flex-col p-1 d-flex">
                        
                        <template v-for="(vehicle, index) in vehicles">
                            <div class="flex gap-3">
                                <div class="flex items-center text-sm w-[3rem] gap-1" style="margin-bottom: -3px;">
                                    <div class="w-[1rem]">
                                        <span class="close-item" @click="deleteItem(index)" v-if="vehicles.length > 1">✕</span>
                                    </div>
                                    <span class="w-[2rem] text-end">
                                        {{ index+1  }}
                                    </span>
                                </div>
                                <fieldset class="w-[20%] form-input required">
                                    <input type="text" class="w-full text-center form-control" required v-model="vehicle.VehicleCode">
                                </fieldset>
                                <fieldset class="w-[20%] form-input required">
                                    <input type="number" class="w-full text-center form-control" required v-model="vehicle.VehicleCapacity">
                                </fieldset>
                            </div>
                        </template>
                    </div>
                </div>
            </div>
        </fieldset>
        <fieldset class="flex flex-col w-full form-input required">
            <legend>Danh sách đại lý</legend>
            <div class="">
                <div>
                    <div class="flex justify-end gap-3">
                        <button type="button" class="btn green w-[6rem]" @click="addItemAgent()">{{ $t('button.add_item') }}</button>
                        <button type="button" class="btn silver w-[6rem]" @click="openFile()">{{ $t('button.import') }}</button>
                        <button type="button" class="btn silver w-[6rem]" @click="resetAgent()">{{ $t('button.reset') }}</button>
                    </div>
                </div>
                <div class="flex gap-3">
                    <div class="w-[3rem] justify-center items-end flex">
                        <div class="w-[1rem]"></div>
                        <span class="w-[2rem] text-end text-sm">
                            {{ agents.length ? agents.length : '' }}
                        </span>
                    </div>
                    <fieldset class="w-[40%] form-input required">
                        <legend>{{ 'Đại lý' }}</legend>
                    </fieldset>
                    <fieldset class="w-[20%] form-input required">
                        <legend>{{ 'Doanh số' }}</legend>
                    </fieldset>
                </div>
                <div style="overflow: auto; border-top: 1px solid gray; border-bottom: 1px solid gray; min-height: 20rem;">
                    <div class="flex-col p-1 d-flex">
                        
                        <template v-for="(agent, index) in agents">
                            <div class="flex gap-3">
                                <div class="flex items-center text-sm w-[3rem] gap-1" style="margin-bottom: -3px;">
                                    <div class="w-[1rem]">
                                        <span class="close-item" @click="deleteItemAgent(index)" v-if="agents.length > 1">✕</span>
                                    </div>
                                    <span class="w-[2rem] text-end">
                                        {{ index+1  }}
                                    </span>
                                </div>
                                <fieldset class="w-[40%] form-input required">
                                    <select2 class="form-control" required :options="agentList" v-model="agent.AgentCode" label="AgentName" :reduce="item => item.AgentCode">
                                        <template #search="{attributes, events}">
                                            <input class="vs__search" :required="agent.AgentCode == null || agent.AgentCode == ''" v-bind="attributes" v-on="events" />
                                        </template>
                                    </select2>
                                </fieldset>
                                <fieldset class="w-[20%] form-input required">
                                    <input type="number" class="w-full form-control" required v-model="agent.AgentDelivery">
                                </fieldset>
                            </div>
                        </template>
                    </div>
                </div>
            </div>
        </fieldset>
    </div>
</template>
<script setup>
import { onMounted, ref, watch, computed } from 'vue'
import { t } from '@/i18n'
import { agentStore } from '@/store/agent';
import { vrpStore } from '@/store/vrp';

const props = defineProps(['show'])
const emit = defineEmits(['close', 'save'])

const confirm = ref(null)
const reload = ref(false)
const file = ref(null)
const agentList = computed(() => agentStore.agentList)
const agents = computed(() => vrpStore.agents)
const vehicles = computed(() => vrpStore.vehicles)

const addItem = () => {
    vrpStore.add()
}

const deleteItem = (index) => {
    vrpStore.delete(index)
}

const reset = () => {
    vrpStore.reset()
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

/**
 * Handle
 */
const getAgentList = async () => {
    await agentStore.list().then((res) => {
        if(res && res.code == 200) {
            agentStore.setAgentList(res.data.items)
        }
    })
}

onMounted(async () => {
    await getAgentList()
})

</script>