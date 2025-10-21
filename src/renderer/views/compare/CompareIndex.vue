<template>
    <div class="gap-1 wrapper-scroll">
        <div class="flex gap-3">
            <div class="basis-[50%] flex flex-col gap-1">
                <div>
                    <button type="button" class="btn green w-[6rem]" @click="openFile1()">File cũ</button>
                    <input id="file1" ref="file1" type="file" @change="onFileChangeOld($event)" class="hidden">
                </div>
                <div>
                    {{ fileOld?.name ?? '' }}
                </div>
            </div>
            <div class="basis-[50%]">
                <div>
                    <button type="button" class="btn green w-[6rem]" @click="openFile2()">File mới</button>
                    <input id="file2" ref="file2" type="file" @change="onFileChangeNew($event)" class="hidden">
                </div>
                <div>
                    {{ fileNew?.name ?? '' }}
                </div>
            </div>
        </div>

        <div class="flex content-center w-full">
            <button type="button" class="btn green w-[6rem]" @click="onCompare()" :disabled="!fileOld || !fileNew">So sánh</button>
        </div>
    </div>
</template>

<script setup>
import { onMounted, onBeforeMount, computed, watch, ref } from 'vue'
import { t } from '@/i18n'
import { compareStore } from '@/store/compare';

const fileOld = ref(null)
const fileNew = ref(null)
const file1 = ref(null)
const file2 = ref(null)

const openFile1 = () => {
    file1.value.value = null
    file1.value.click()
}

const openFile2 = () => {
    file2.value.value = null
    file2.value.click()
}

const onFileChangeOld = (e) => {
    fileOld.value = e.target.files ? e.target.files[0] : null
}

const onFileChangeNew = (e) => {
    fileNew.value = e.target.files ? e.target.files[0] : null
}

const onCompare = async (e) => {
    let formData = new FormData();
    formData.append('file1', fileOld.value);
    formData.append('file2', fileNew.value);
    await compareStore.import(formData).then((res) => {
        if(res && res.code == 200) {
            fileOld.value = null
            fileNew.value = null
        }
    })
}

onMounted(async () => {
})
</script>