<template>
  <div class="dropdown">
    <label for="option">{{ nameDropdown }}</label>
    <select id="option" v-model="selected" @change="updatestoreScansData">
      <option disabled value="">Veuillez sélectionner une carte</option>
      <option v-for="val in options" :key="val.id" :value="val">
        {{ val.name }}
      </option>
    </select>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useScanStore } from '../store/scan'

const scanStore = useScanStore()

const selected = ref('')

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
})

function updatestoreScansData() {
  scanStore.updateSelectedScan(selected.value)
  scanStore.updateCurrentScanInfo(selected.value.collecInfo)
}
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
