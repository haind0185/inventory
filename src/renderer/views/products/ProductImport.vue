<template>
    <Modal :show="show" :title="title" maxWidth="max-w-3xl" @close="onClose()" class="">
        <div>
            <label for="">
                <input type="file" @change="onFileChange($event)">
                add
            </label>
        </div>
    </Modal>
    <Confirm ref="confirm"></Confirm>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue'
import { t } from '@/i18n'
import { productStore } from '@/store/product';
import { UNIT } from '@/constant';

const props = defineProps(['show'])
const emit = defineEmits(['close', 'save'])
const title = t("modal.add_product")

const confirm = ref(null)
const reload = ref(false)
const optionsList = ref(UNIT)

const onClose = () => {
    emit('close', reload.value)
}

const onFileChange = async (e) => {
    let file = e.target.files ? e.target.files[0] : null
    console.log(file)
    if(file) {
        let formData = new FormData();
        formData.append('file', file);
        await productStore.import(formData).then((res) => {
            console.log(res)
        })
    }
}

const onSave = async () => {
    
}

</script>