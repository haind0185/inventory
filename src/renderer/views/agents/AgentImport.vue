<template>
    <Modal :show="show" :title="title" maxWidth="max-w-6xl" @close="onClose()" class="">
        <form class="flex flex-col justify-between gap-3 p-2" @submit.prevent="onSave()" style="height: 40rem;" >
            <div class="flex justify-between p-2">
                <div>
                </div>
                <div class="flex justify-end gap-3">
                    <button type="button" class="btn green w-[6rem]" @click="addItem()">{{ $t('button.add_item') }}</button>
                    <input id="file" ref="file" type="file" @change="onFileChange($event)" class="hidden">
                    <button type="button" class="btn silver w-[6rem]" @click="openFile()">{{ $t('button.import') }}</button>
                    <button type="button" class="btn silver w-[6rem]" @click="reset()">{{ $t('button.reset') }}</button>
                </div>
            </div>
            <div class="flex gap-3">
                <div class="w-[3rem] justify-center items-end flex">
                    <div class="w-[1rem]"></div>
                    <span class="w-[2rem] text-end text-sm">
                        {{ agents.length ? agents.length : '' }}
                    </span>
                </div>
                <fieldset class="w-[10%] form-input required">
                    <legend>{{ $t("attr.agent.AgentCode") }}</legend>
                </fieldset>
                <fieldset class="w-[20%] form-input required">
                    <legend>{{ $t("attr.agent.AgentName") }}</legend>
                </fieldset>
                <fieldset class="w-[40%] form-input required">
                    <legend>{{ $t("attr.agent.AgentAddress") }}</legend>
                </fieldset>
                <fieldset class="w-[30%] form-input required">
                    <legend>{{ $t("attr.agent.AgentLocation") }}</legend>
                </fieldset>
            </div>
            <div class="flex-1" style="overflow: auto; border-top: 1px solid gray; border-bottom: 1px solid gray;">
                <div class="flex-col p-1 d-flex">
                    
                    <template v-for="(agent, index) in agents">
                        <div class="flex gap-3">
                            <div class="flex items-center text-sm w-[3rem] gap-1" style="margin-bottom: -3px;">
                                <div class="w-[1rem]">
                                    <span class="close-item" @click="deleteItem(index)" v-if="agents.length > 1">✕</span>
                                </div>
                                <span class="w-[2rem] text-end">
                                    {{ index+1  }}
                                </span>
                            </div>
                            <fieldset class="w-[10%] form-input required">
                                <input type="text" class="w-full text-center form-control" required v-model="agent.AgentCode">
                            </fieldset>
                            <fieldset class="w-[20%] form-input required">
                                <input type="text" class="w-full form-control" required v-model="agent.AgentName">
                            </fieldset>
                            <fieldset class="w-[40%] form-input required">
                                <input type="text" class="w-full form-control" required v-model="agent.AgentAddress">
                            </fieldset>
                            <fieldset class="w-[15%] form-input required">
                                <input type="number" step="any" class="w-full text-center form-control" required v-model="agent.AgentLocationX">
                            </fieldset>
                            <fieldset class="w-[15%] form-input required">
                                <input type="number" step="any" class="w-full text-center form-control" required v-model="agent.AgentLocationY">
                            </fieldset>
                            
                        </div>
                    </template>
                </div>
            </div>

            <div class="flex items-center justify-around w-full" style="height: 3rem;">
                <button type="button" class="btn silver w-[6rem]" @click="onClose()">{{ $t("button.cancel") }}</button>
                <button type="submit" class="btn w-[6rem]" :disabled="agents.length <= 0">{{ $t("button.save") }}</button>
            </div>
        </form>
    </Modal>
    <Confirm ref="confirm"></Confirm>
</template>

<script setup>
import { onMounted, ref, watch, computed } from 'vue'
import { t } from '@/i18n'
import { agentStore } from '@/store/agent';

const props = defineProps(['show'])
const emit = defineEmits(['close', 'save'])
const title = t("modal.add_agent")

const confirm = ref(null)
const reload = ref(false)
const file = ref(null)
const agents = computed(() => agentStore.agents)

const onClose = () => {
    emit('close', reload.value)
}


const addItem = () => {
    agentStore.add()
}

const deleteItem = (index) => {
    agentStore.delete(index)
}

const openFile = () => {
    file.value.value = null
    file.value.click()
}

const setAgents = (data) => {
    agentStore.reset()
    for(const i in data) {
        let agent = {...agentStore.init}

        if(data[i].AgentCode) {
            agent.AgentCode = data[i].AgentCode
        }
        if(data[i].AgentName) {
            agent.AgentName = data[i].AgentName
        }
        if(data[i].AgentAddress) {
            agent.AgentAddress = data[i].AgentAddress
        }
        if(data[i].AgentLocationX) {
            agent.AgentLocationX = data[i].AgentLocationX
        }
        if(data[i].AgentLocationY) {
            agent.AgentLocationY = data[i].AgentLocationY
        }
        
        agentStore.setAgent(agent)
    }
}

const onFileChange = async (e) => {
    let file = e.target.files ? e.target.files[0] : null
    if(file) {
        let formData = new FormData();
        formData.append('file', file);
        await agentStore.import(formData).then((res) => {
            if(res && res.code == 200) {
                setAgents(res.data)
            }
        })
    }
}

const reset = () => {
    agentStore.reset()
}

const onSave = async () => {
    const res = await agentStore.bulkCreate({agents: agents.value}).then((res) => {
        if (res && res.code == 200) {
            reload.value = true
            return true
        }
        return false
    })
    if (res) {
        await confirm.value.show({
            title: t("title.notify"),
            message: t("msg.save_ok"),
            cancelButton: t("button.back"),
            type: 1
        })
        agentStore.reset()
        emit('save', reload.value)
    }
}

</script>