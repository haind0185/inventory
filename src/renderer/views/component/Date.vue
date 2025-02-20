<template>
    <Datepicker
        :enableTimePicker="false"
        :class="class"
        v-model="value"
        :format="format"
        locale="en"
        cancelText=""
        selectText=""
        auto-apply
        keep-action-row
        :close-on-auto-apply="true"
        :position="position"
        @focus="openDatepicker"
        @keydown.tab.prevent="focusNextInput"
        @closed="focusNextInput"
        ref="datepicker"
        :input-id="id">
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
            value: null,
            id: Date.now() + '-' + Math.round(Math.random() * 1E9)
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
    },
    mounted() {
        this.setDatepickerId()
    },
    methods: {
        openDatepicker: function () {
            this.$refs.datepicker.openMenu()
        },
        focusNextInput: function (event) {
            if(event) {
                event.preventDefault()
            }
            if (this.$refs.datepicker) {
                this.$refs.datepicker.closeMenu()
            }

            setTimeout(() => {
                let focusableElements = Array.from(document.querySelectorAll("input"))
                let currentIndex = focusableElements.findIndex(el => el.id === this.id)
                
                if (currentIndex !== -1 && currentIndex < focusableElements.length - 1) {
                    focusableElements[currentIndex + 1].focus()
                }
            }, 100)
        },
        setDatepickerId: function () {
            if (this.$refs.datepicker && this.$refs.datepicker.$el) {
                let inputElement = this.$refs.datepicker.$el.querySelector("input.dp__input")
                if (inputElement) {
                    inputElement.id = this.id
                }
            }
        },
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
