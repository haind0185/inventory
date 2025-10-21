<template>
    <v-select
        required
        v-model="value"
        :options="options"
        :label="label"
        :reduce="reduce"
        ref="vueSelect"
        >
        <template #search="slotProps">
            <slot name="search" v-bind="slotProps" />
        </template>
    </v-select>
</template>

<script setup>
import vSelect from "vue-select";
import "vue-select/dist/vue-select.css";
</script>

<script>
export default {
    props: {
        modelValue: {},
        options: { type: Array },
        label: { type: String },
        reduce: { type: Function },
    },
    emits: ['update:modelValue'],
    data: function () {
        return {
            value: null,
            id: Date.now() + '-' + Math.round(Math.random() * 1E9),
            exceptFocus: ['multiple-customer']
        }
    },
    computed: {},
    watch: {
        'value': function () {
            this.$emit('update:modelValue', this.value)
        },
        'modelValue': function () {
            this.value = this.modelValue
            this.focusNextInput()
        }
    },
    created: function () {
        this.value = this.modelValue
    },
    mounted() {
        this.setDatepickerId()
    },
    methods: {
        setDatepickerId: function () {
            if (this.$refs.vueSelect && this.$refs.vueSelect.$el) {
                let inputElement = this.$refs.vueSelect.$el.querySelector("input")
                if (inputElement) {
                    inputElement.id = this.id
                }
            }
        },
        focusNextInput: function () {
            let focusableElements = Array.from(document.querySelectorAll("input"))
            let currentIndex = focusableElements.findIndex(el => el.id === this.id)
            if(this.exceptFocus.includes(focusableElements[currentIndex].getAttribute('data-extra'))) return
            
            if (currentIndex !== -1 && currentIndex < focusableElements.length - 1) {
                focusableElements[currentIndex + 1].focus()
            }
        },
    }
}
</script>