<template>
  <div class="critere-selection" @submit.prevent="handleSubmit">
    <form class="criteria-form" action="">
      <div class="form-row">
        <div class="form-group half">
          <label for="yearMin">Année min.</label>
          <input id="yearMin" type="text" v-model="yearMin" autocomplete="off" />
        </div>
        <div class="form-group half">
          <label for="yearMax">Année max.</label>
          <input id="yearMax" type="text" v-model="yearMax" autocomplete="off" />
        </div>
      </div>

      <div class="form-row">
        <div class="form-group half">
          <label for="scaleMin">Echelle min.</label>
          <div class="combo-input-container">
            <input
              id="scaleMin"
              type="text"
              v-model="scaleMin"
              autocomplete="off"
              @focus="showScaleMinOptions = true"
              @blur="hideScaleMinOptionsDelayed"
            />
            <button
              type="button"
              class="dropdown-toggle"
              @click="showScaleMinOptions = !showScaleMinOptions"
            >
              <SvgIcon :path="mdiMenuDown" type="mdi" class="i" />
            </button>
            <div class="dropdown-options" v-if="showScaleMinOptions">
              <div
                v-for="scale in scaleOptions"
                :key="scale"
                class="dropdown-item"
                @mousedown.prevent="selectScaleMin(scale)"
              >
                1:{{ scale }}
              </div>
            </div>
          </div>
        </div>
        <div class="form-group half">
          <label for="scaleMax">Echelle max.</label>
          <div class="combo-input-container">
            <input
              id="scaleMax"
              type="text"
              v-model="scaleMax"
              autocomplete="off"
              @focus="showScaleMaxOptions = true"
              @blur="hideScaleMaxOptionsDelayed"
            />
            <button
              type="button"
              class="dropdown-toggle"
              @click="showScaleMaxOptions = !showScaleMaxOptions"
            >
              <SvgIcon :path="mdiMenuDown" type="mdi" class="i" />
            </button>
            <div class="dropdown-options" v-if="showScaleMaxOptions">
              <div
                v-for="scale in scaleOptions"
                :key="scale"
                class="dropdown-item"
                @mousedown.prevent="selectScaleMax(scale)"
              >
                1:{{ scale }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Dropdown
        nameDropdown="Collections"
        :options="collectionOptions"
        @update:selected="updateSelectedCollection"
        :defaultValue="{ id: '0', name: 'Toutes les collections' }"
      />

      <div class="button-group">
        <button type="submit" class="button search-button">
          <SvgIcon :path="mdiMagnify" type="mdi" class="i" />
          <span>Rechercher</span>
        </button>
        <button type="button" class="button reset-button" @click="resetForm">
          <SvgIcon :path="mdiRefresh" type="mdi" class="i" />
          <span>Réinitialiser</span>
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Dropdown from '@/components/material/Dropdown.vue'
import { eventBus } from '@/components/composable/eventBus'

import { useScanStore } from '@/components/store/scan'
import { storeToRefs } from 'pinia'
import { mdiRefresh, mdiMagnify, mdiMenuDown } from '@mdi/js'

const scanStore = useScanStore()
const { storeCritereSelection } = storeToRefs(scanStore)

const yearMin = ref(storeCritereSelection.value.yearMin || '')
const yearMax = ref(storeCritereSelection.value.yearMax || '')
const scaleMin = ref(storeCritereSelection.value.scaleMin || '500')
const scaleMax = ref(storeCritereSelection.value.scaleMax || '100000')
const selectedCollection = ref({ id: '', name: '' })

const scaleOptions = ['500', '1000', '2000', '5000', '10000', '25000', '50000', '80000', '100000', '200000', '250000', '500000', '1000000', '5000000', '10000000']

const showScaleMinOptions = ref(false)
const showScaleMaxOptions = ref(false)

const collectionOptions = ref([
  {
    id: '0',
    name: 'Toutes les collections',
  },
  {
    id: '1',
    name: 'CADASTRE',
  },
  {
    id: '2',
    name: 'CASSINI',
  },
  {
    id: '3',
    name: 'DEPARTEMENTS',
  },
  {
    id: '4',
    name: 'EM_CARTES',
  },
  {
    id: '5',
    name: 'EM_MINUTES',
  },
  {
    id: '6',
    name: 'FR_100K_A_200K',
  },
  {
    id: '7',
    name: 'FR_10K_A_50K',
  },
  {
    id: '8',
    name: 'FR_2K_A_5K',
  },
  {
    id: '9',
    name: 'FR_THEMATIQUE_GEN',
  },
  {
    id: '10',
    name: 'FR_THEMATIQUE_LOC',
  },
  {
    id: '11',
    name: 'PLANS_DE_VILLE',
  },
  {
    id: '12',
    name: 'REGION_PARISIENNE',
  },
  {
    id: '13',
    name: 'TOPO_DIVERS',
  },
  {
    id: '14',
    name: 'URBANISME',
  },
])

const selectScaleMin = (scale) => {
  scaleMin.value = scale
  showScaleMinOptions.value = false
}

const selectScaleMax = (scale) => {
  scaleMax.value = scale
  showScaleMaxOptions.value = false
}

const hideScaleMinOptionsDelayed = () => {
  setTimeout(() => {
    showScaleMinOptions.value = false
  }, 200)
}

const hideScaleMaxOptionsDelayed = () => {
  setTimeout(() => {
    showScaleMaxOptions.value = false
  }, 200)
}

const initialValues = {
  yearMin: '',
  yearMax: '',
  scaleMin: '',
  scaleMax: '',
  selectedCollection: null,
}

const handleSubmit = () => {
  eventBus.emit('reset')

  const criteria = {
    yearMin: yearMin.value,
    yearMax: yearMax.value,
    scaleMin: scaleMin.value,
    scaleMax: scaleMax.value,
    selectedCollection:
      selectedCollection.value.name === 'Toutes les collections'
        ? null
        : selectedCollection.value.name,
  }
  scanStore.updateCriteria(criteria)
}

const resetForm = () => {
  yearMin.value = initialValues.yearMin
  yearMax.value = initialValues.yearMax
  scaleMin.value = initialValues.scaleMin
  scaleMax.value = initialValues.scaleMax
  selectedCollection.value = { id: '', name: '' }
  scanStore.resetCriteria()

  eventBus.emit('criteria-reset', { resetDropdown: true })
}

const updateSelectedCollection = (selected) => {
  selectedCollection.value = selected
}
</script>

<style scoped>
.critere-selection {
  padding-top: 10px;
  width: 100%;
  box-sizing: border-box;
}

.criteria-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
}

.form-row {
  display: flex;
  gap: 12px;
  width: 100%;
  flex-wrap: wrap;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
  box-sizing: border-box;
}

.form-group.half {
  flex: 1;
  min-width: calc(50% - 6px);
  max-width: calc(50% - 6px);
}

.form-group label {
  font-size: 14px;
  color: #555;
  font-weight: 500;
}

.form-group input {
  padding: 10px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
  width: 100%;
  box-sizing: border-box;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.form-group input:focus {
  border-color: #739614;
  outline: none;
  box-shadow: 0 0 0 3px rgba(115, 150, 20, 0.15);
}

.combo-input-container {
  position: relative;
  width: 100%;
}

.combo-input-container input {
  padding-right: 35px;
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
  top: 100%;
  left: 0;
  width: 100%;
  color: black;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 0 0 6px 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  max-height: 200px;
  overflow-y: auto;
  z-index: 10;
}

.dropdown-item {
  padding: 10px 12px;
  cursor: pointer;
  transition: background-color 0.2s;
  font-size: 14px;
}

.dropdown-item:hover {
  background-color: #f5f5f5;
  color: #739614;
}

.button-group {
  display: flex;
  gap: 12px;
  margin-top: 5px;
}

.button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
  flex: 1;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  min-height: 44px;
}

.search-button {
  background-color: #739614;
  color: white;
  border: 1px solid #739614;
}

.search-button:hover {
  background-color: #628012;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.15);
  transform: translateY(-1px);
}

.search-button:active {
  transform: translateY(1px);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.reset-button {
  background-color: white;
  color: #555;
  border: 1px solid #e0e0e0;
}

.reset-button:hover {
  background-color: #f7f7f7;
  border-color: #d0d0d0;
  color: #739614;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.08);
  transform: translateY(-1px);
}

.reset-button:active {
  transform: translateY(1px);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.i {
  font-size: 18px;
  width: 18px;
  height: 18px;
}

@media (max-width: 500px) {
  .form-row {
    flex-direction: column;
    gap: 15px;
  }

  .form-group.half {
    min-width: 100%;
    max-width: 100%;
  }

  .button-group {
    flex-direction: column;
  }

  .button {
    width: 100%;
  }
}
</style>
