<template>
    <div class="form-group combo-input-wrapper" :class="class">
      <label :for="id">{{ label }}</label>
      <div class="combo-input-container">
        <input
        :id="id"
        type="text"
        :value="modelValue"
        autocomplete="off"
        @input="$emit('update:modelValue', $event.target.value)"
        @focus="$emit('toggle', true)"
        @blur="handleBlur"
      />
        <button
          type="button"
          class="dropdown-toggle"
          @click="$emit('toggle', true)"
        >
          <SvgIcon :path="mdiMenuDown" type="mdi" />
        </button>
        <div class="dropdown-options" v-if="showOptions">
          <div
            v-for="option in options"
            :key="option"
            class="dropdown-item"
            @mousedown.prevent="$emit('select', option)"
          >
            {{ option }}
          </div>
        </div>
      </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { mdiMenuDown } from '@mdi/js'

defineProps({
  id: String,
  label: String,
  modelValue: [String, Number],
  options: Array,
  showOptions: Boolean,
  class: String
})
const emit = defineEmits(['update:modelValue', 'toggle', 'hide', 'select'])

const inputFocused = ref(false)

const handleBlur = () => {
    if (!inputFocused.value) {
      emit('hide')
    }
}

</script>

<style scoped>
.form-group.combo-input-wrapper {
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
  box-sizing: border-box;
}

.form-group.combo-input-wrapper label {
  font-size: 14px;
  color: #555;
  font-weight: 500;
}

.combo-input-container {
  position: relative;
  width: 100%;
}

.combo-input-container input {
  width: 100%;
  padding: 10px 35px 10px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
  transition: all 0.2s;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  box-sizing: border-box;
}

.combo-input-container input:focus {
  border-color: #739614;
  outline: none;
  box-shadow: 0 0 0 3px rgba(115, 150, 20, 0.15);
}

.dropdown-toggle {
  position: absolute;
  right: 0;
  top: 0;
  height: 100%;
  width: 35px;
  background: transparent;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #666;
  font-size: 20px;
  z-index: 1;
}

.dropdown-toggle:hover {
  color: #739614;
}

.dropdown-options {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  width: 100%;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  max-height: 200px;
  overflow-y: auto;
  z-index: 100;
  margin-top: 2px;
}

.dropdown-item {
  padding: 10px 12px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
  color: #333;
}

.dropdown-item:hover {
  background-color: #f5f5f5;
  color: #739614;
}

.dropdown-item:first-child {
  border-top-left-radius: 6px;
  border-top-right-radius: 6px;
}

.dropdown-item:last-child {
  border-bottom-left-radius: 6px;
  border-bottom-right-radius: 6px;
}
</style>