<template>
    <Modal :show="show" :title="title" maxWidth="max-w-lg" @close="onClose()" class="">
        <form class="flex flex-col justify-between h-full gap-1 p-2" @submit.prevent="onSave()">
            <div class="flex-col gap-1 d-flex">
                <!-- AgentCode -->
                <fieldset class="w-[100%] form-input required">
                    <legend>{{ $t("attr.agent.AgentCode") }}</legend>
                    <input type="text" class="w-full text-center form-control" required v-model="payload.AgentCode">
                </fieldset>

                <!-- AgentName -->
                <fieldset class="w-[100%] form-input required">
                    <legend>{{ $t("attr.agent.AgentName") }}</legend>
                    <input type="text" class="w-full form-control" required v-model="payload.AgentName">
                </fieldset>

                <!-- AgentAddress -->
                <fieldset class="w-[100%] form-input required">
                    <legend>{{ $t("attr.agent.AgentAddress") }}</legend>
                    <textarea class="w-full form-control" required v-model="payload.AgentAddress"></textarea>
                </fieldset>

                <!-- AgentLocation -->
                <fieldset class="w-[100%] form-input required">
                    <legend>{{ $t("attr.agent.AgentLocation") }}</legend>
                    <div class="flex gap-1">
                        <input type="number" step="any" class="w-[50%] form-control text-center" required v-model="payload.AgentLocationX">
                        <input type="number" step="any" class="w-[50%] form-control text-center" required v-model="payload.AgentLocationY">
                    </div>
                </fieldset>
            </div>

            <div class="flex justify-around w-full mt-[10rem]">
                <button type="button" class="btn silver w-[6rem]" @click="onClose()">{{ $t("button.cancel") }}</button>
                <button type="submit" class="btn w-[6rem]">{{ $t("button.save") }}</button>
            </div>
        </form>
    </Modal>
    <Confirm ref="confirm"></Confirm>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue'
import { t } from '@/i18n'
import { agentStore } from '@/store/agent';

const props = defineProps(['show'])
const emit = defineEmits(['close', 'save'])
const title = t("modal.add_agent")

const payload = ref({
    AgentCode: null,
    AgentName: null,
    AgentAddress: null,
    AgentLocationX: null,
    AgentLocationY: null,
})
const confirm = ref(null)
const reload = ref(false)

const onClose = () => {
    emit('close', reload.value)
}

const onSave = async () => {
    const res = await agentStore.store(payload.value).then((res) => {
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
        emit('save', reload.value)
    }

}
</script>