<template>
  <div class="dropdown">
    <label for="option">{{ nameDropdown }}</label>
    <select id="option" v-model="selected" @change="updatestoreScansData">
      <option disabled value="" v-if="disableOption">{{ disableOption }}</option>
      <option v-for="val in options" :key="val.id" :value="val">
        {{ val.name }}
      </option>
    </select>
  </div>
</template>

<script setup>
import { ref, watchEffect } from 'vue'
import { eventBus } from '../composable/eventBus'
import { useScanStore } from '../store/scan'

const scanStore = useScanStore()

const props = defineProps({
  nameDropdown: {
    type: String,
    default: '',
  },
  options: {
    type: Array,
    default: [
      { id: 'EPSG:3857', name: 'Web Mercator' },
      { id: 'EPSG:4326', name: 'WGS 84' },
      { id: 'EPSG:2154', name: 'Lambert 93' },
    ],
  },
  disableOption: {
    type: String,
  },
  defaultValue: {
    type: Object,
  },
})

const selected = ref('')

const emit = defineEmits()

function updatestoreScansData() {
  emit('update:selected', selected.value) // pour choisir la collection
  scanStore.updateSelectedScan(selected.value)
}

watchEffect(() => {
  if (props.defaultValue) {
    selected.value = props.defaultValue
  }
  eventBus.on('criteria-reset', (payload) => {
    if (payload?.resetDropdown) {
      selected.value = ''
    }
  })
})
</script>

<style scoped>
.dropdown {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.dropdown label {
  font-size: 14px;
  color: #555;
}

.dropdown select {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}
</style>
