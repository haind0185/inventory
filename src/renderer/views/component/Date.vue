<template>
    <Datepicker :enableTimePicker="false" :class="class" v-model="value" :format="format" locale="en" cancelText=""
        selectText="" auto-apply keep-action-row :close-on-auto-apply="true" :position="position">
    </Datepicker>
</template>
<script setup>
import Datepicker from "@vuepic/vue-datepicker";
import "@vuepic/vue-datepicker/dist/main.css";
import { helper } from "../../helper";
</script>
<script>
export default {
    props: {
        modelValue: {},
        class: { type: String },
        format: { type: String, default: 'dd/MM/yyyy' },
        position: { type: String, default: 'right' }
    },
    emits: ['update:modelValue'],
    data: function () {
        return {
            value: null
        }
    },
    computed: {},
    watch: {
        'value': function () {
            this.$emit('update:modelValue', helper.timeToString(this.value))
        },
        'modelValue': function () {
            this.value = this.modelValue
        }
    },
    created: function () {
        this.value = this.modelValue
    }
}
</script>
<style>
.dp__input {
    font-size: 14px;
    padding: 2px 20px;
    height: 25px;
    text-align: center;
}

.dp__input_icons {
    padding: 2px 2px;
    margin-left: 4px;
    width: 12px;
    height: 12px;
}
</style>
