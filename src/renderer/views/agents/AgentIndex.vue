<template>
    <div class="gap-1 wrapper-scroll">
        <form class="flex content-between gap-3" @submit.prevent="submit()">
            <div class="flex flex-col flex-1">
                <div class="flex w-[80%] gap-3">
                    <fieldset class="form-input w-[40%]">
                        <legend>{{ $t("attr.agent.AgentCode") }}</legend>
                        <input type="text" class="w-full form-control" v-model="search.AgentCode">
                    </fieldset>
    
                    <fieldset class="form-input w-[60%]">
                        <legend>{{ $t("attr.agent.AgentName") }}</legend>
                        <input type="text" class="w-full form-control" v-model="search.AgentName">
                    </fieldset>
                </div>
                <div class="flex w-[80%] gap-3">
                    <fieldset class="w-full form-input">
                        <legend>{{ $t("attr.agent.AgentAddress") }}</legend>
                        <input type="text" class="w-full form-control" v-model="search.AgentAddress">
                    </fieldset>
                </div>
            </div>
            <div class="flex items-end gap-3">
                <button type="submit" class="btn w-[6rem]">{{ $t("button.search") }}</button>
                <button type="button" class="btn silver w-[6rem]" @click="clear()">{{ $t("button.clear") }}</button>
            </div>
        </form>

        <div class="flex mt-5">
            <div class="w-[40%] flex">
                <Pagination v-if="agents.total" v-model="search.page" class="mb-0" :page-count="agents.page_count ?? 0" :click-handler="pagination"></Pagination>
                
            </div>
            <div class="flex justify-center w-[20%] items-center">
                <span v-if="agents.total">
                    {{ format_number(agents.firstItem) }}-{{ format_number(agents.lastItem) }}/{{  format_number(agents.total) }}
                </span>
            </div>
            <div class="flex justify-end w-[40%] gap-3">
                <button type="button" class="btn green w-[6rem]" @click="onShowAdd()">{{ $t("button.add") }}</button>
                <button type="button" class="btn silver w-[6rem]" @click="onShowImport()">{{ $t("button.import") }}</button>
            </div>
        </div>

        <div class="parent-scroll">
            <table class="view-scroll t-border">
                <thead>
                    <tr>
                        <th class="w-[9rem]">
                            <th-sort @sort="sort()" :search="search" :field="'AgentCode'">{{ $t("attr.agent.AgentCode") }}</th-sort>
                        </th>
                        <th class="">
                            <th-sort @sort="sort()" :search="search" :field="'AgentName'">{{ $t("attr.agent.AgentName") }}</th-sort>
                        </th>
                        <th class="">
                            <th-sort @sort="sort()" :search="search" :field="'AgentAddress'">{{ $t("attr.agent.AgentAddress") }}</th-sort>
                        </th>
                        <th class="">
                            {{ $t("attr.agent.AgentLocation") }}
                        </th>
                        <th class="w-[2rem]">
                            .
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="item in agents.items">
                        <td class="text-center">{{ item.AgentCode }}</td>
                        <td class="text-left">{{ item.AgentName }}</td>
                        <td class="text-left">{{ item.AgentAddress }}</td>
                        <td class="text-center">{{ `${item.AgentLocationX}, ${item.AgentLocationY}` }}</td>
                        <td class="text-center">
                            <a href="javascript:void(0)" class="a-detail" @click="onShowDetail(item.AgentCode)">🃪</a>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <AgentAddModal
            v-if="showAdd"
            :show="showAdd"
            @close="onCloseAdd($event)"
            @save="onSaveAdd($event)" />

        <AgentImport
            v-if="showImport"
            :show="showImport"
            @close="onCloseImport($event)"
            @save="onSaveImport($event)" />

        <AgentDetail
            v-if="showDetail"
            :show="showDetail"
            :data="detail"
            @close="onCloseDetail($event)"
            @save="onSaveDetail($event)" />
    </div>
</template>

<script setup>
import { onMounted, onBeforeMount, computed, watch, ref } from 'vue'
import { agentStore } from '@/store/agent';
import AgentAddModal from './AgentAddModal.vue'
import AgentImport from './AgentImport.vue'
import AgentDetail from './AgentDetail.vue'

const showAdd = ref(false)
const showImport = ref(false)
const showDetail = ref(false)
const search = computed(() => agentStore.search)
const agents = ref({})
const detail = ref({})

const onShowAdd = () => {
    showAdd.value = true
}
const onCloseAdd = (event) => {
    showAdd.value = false
    if(event) {
        index()
    }
}
const onSaveAdd = (event) => {
    showAdd.value = false
    if(event) {
        index()
    }
}

const onShowImport = () => {
    showImport.value = true
}
const onCloseImport = (event) => {
    showImport.value = false
    if(event) {
        index()
    }
}
const onSaveImport = (event) => {
    showImport.value = false
    if(event) {
        index()
    }
}

const clear = async () => {
    agentStore.resetSearch()
    await index()
}

const submit = async () => {
    agentStore.setSearch()
    await index()
}

const index = async () => {
    await agentStore.index(search.value).then((res) => {
        if(res && res.code == 200) {
            agents.value = res.data
        }
    })
}

const sort = async () => {
    if (agents.value.total > 0) {
        search.value.page = 1
        await index()
    }
}

const pagination = (page) => {
    search.value.page = page
    index()
}

const onShowDetail = async (AgentCode) => {
    await agentStore.show({AgentCode: AgentCode}).then((res) => {
        if(res && res.code == 200) {
            detail.value = res.data
            showDetail.value = true
        }
    })
}
const onCloseDetail = (event) => {
    showDetail.value = false
    if(event) {
        index()
    }
}
const onSaveDetail = (event) => {
    showDetail.value = false
    if(event) {
        index()
    }
}

onMounted(async () => {
    await index()
})
</script>