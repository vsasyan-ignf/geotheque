<template>
  <div class="critere-selection">
    <form class="criteria-form" @submit.prevent="handleSubmit">

      <div class="form-row">
        <FormInput 
          class="half"
          label="Année min."
          id="yearMin"
          v-model="formData.yearMin"
        />
        <FormInput 
          class="half"
          label="Année max."
          id="yearMax"
          v-model="formData.yearMax"
        />
      </div>

      <div class="form-row" v-if="isCartotheque">
        <ComboInput
          class="half"
          label="Echelle min."
          id="scaleMin"
          v-model="formData.scaleMin"
          :options="scaleOptions"
          :showOptions="showScaleMinOptions"
          @toggle="showScaleMinOptions = !showScaleMinOptions"
          @select="selectScaleMin"
          @hide="showScaleMinOptions = false"
        />
        <ComboInput
          class="half"
          label="Echelle max."
          id="scaleMax"
          v-model="formData.scaleMax"
          :options="scaleOptions"
          :showOptions="showScaleMaxOptions"
          @toggle="showScaleMaxOptions = !showScaleMaxOptions"
          @select="selectScaleMax"
          @hide="showScaleMaxOptions = false"
        />
      </div>

      <div class="form-row" v-if="isPhototheque">
        <ComboInput
          class="half"
          label="Commanditaire"
          id="commanditaire"
          v-model="formData.commanditaire"
          :options="commanditaireOptions"
          :showOptions="showCommanditaireOptions"
          @toggle="showCommanditaireOptions = !showCommanditaireOptions"
          @select="selectCommanditaire"
          @hide="showCommanditaireOptions = false"
        />
        <ComboInput
          class="half"
          label="Producteur"
          id="producteur"
          v-model="formData.producteur"
          :options="producteurOptions"
          :showOptions="showProducteurOptions"
          @toggle="showProducteurOptions = !showProducteurOptions"
          @select="selectProducteur"
          @hide="showProducteurOptions = false"
        />
      </div>
      
      <Dropdown
        v-if="isCartotheque"
        nameDropdown="Collections"
        :options="collectionOptions"
        @update:selected="updateSelectedCollection"
        :defaultValue="defaultCollection"
      />

      <Dropdown
        v-if="isPhototheque"
        nameDropdown="Support"
        :options="collectionOptions"
        @update:selected="updateSelectedCollection"
        :defaultValue="defaultCollection"
      />

      <div class="button-group">
       
        <button type="button" class="button reset-button" @click="resetForm">
          <SvgIcon :path="mdiRefresh" type="mdi" />
          <span>Réinitialiser</span>
        </button>

        <button type="submit" class="button search-button">
          <SvgIcon :path="mdiMagnify" type="mdi" />
          <span>Rechercher</span>
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import Dropdown from '@/components/material/Dropdown.vue'

import FormInput from '@/components/material/FormInput.vue'
import ComboInput from '@/components/material/ComboInput.vue'

import { eventBus } from '@/components/composable/eventBus'
import { useScanStore } from '@/components/store/scan'
import { storeToRefs } from 'pinia'
import { mdiRefresh, mdiMagnify } from '@mdi/js'

const scanStore = useScanStore()
const { storeCritereSelection, activeTab } = storeToRefs(scanStore)

const isCartotheque = computed(() => ['cartotheque', 'cartotheque_etranger'].includes(activeTab.value))
const isPhototheque = computed(() => ['phototheque', 'phototheque_etranger'].includes(activeTab.value))

const defaultCollection = { id: '0', name: 'Toutes les collections' }

const formData = ref({
  yearMin: storeCritereSelection.value.yearMin || '',
  yearMax: storeCritereSelection.value.yearMax || '',
  scaleMin: String(storeCritereSelection.value.scaleMin || '500'),
  scaleMax: String(storeCritereSelection.value.scaleMax || '100000'),
  commanditaire: storeCritereSelection.value.commanditaire || '',
  producteur: storeCritereSelection.value.producteur || '',
  selectedCollection: { id: '0', name: 'Toutes les collections' }
})

const scaleOptions = [
  '500',
  '1000',
  '2000',
  '5000',
  '10000',
  '25000',
  '50000',
  '80000',
  '100000',
  '200000',
  '250000',
  '500000',
  '1000000',
  '5000000',
  '10000000',
]

const commanditaireOptions = ref(['IGN', 'Autres'])
const producteurOptions = ref(['IGN', 'Autres'])

const collectionOptions = ref([
  defaultCollection,
  { id: '1', name: 'CADASTRE' },
  { id: '2', name: 'CASSINI' },
  { id: '3', name: 'DEPARTEMENTS' },
  { id: '4', name: 'EM_CARTES' },
  { id: '5', name: 'EM_MINUTES' },
  { id: '6', name: 'FR_100K_A_200K' },
  { id: '7', name: 'FR_10K_A_50K' },
  { id: '8', name: 'FR_2K_A_5K' },
  { id: '9', name: 'FR_THEMATIQUE_GEN' },
  { id: '10', name: 'FR_THEMATIQUE_LOC' },
  { id: '11', name: 'PLANS_DE_VILLE' },
  { id: '12', name: 'REGION_PARISIENNE' },
  { id: '13', name: 'TOPO_DIVERS' },
  { id: '14', name: 'URBANISME' }
])

const showScaleMinOptions = ref(false)
const showScaleMaxOptions = ref(false)
const showCommanditaireOptions = ref(false)
const showProducteurOptions = ref(false)

const selectScaleMin = (scale) => {
  formData.value.scaleMin = scale
  showScaleMinOptions.value = false
}

const selectScaleMax = (scale) => {
  formData.value.scaleMax = scale
  showScaleMaxOptions.value = false
}

const selectCommanditaire = (option) => {
  formData.value.commanditaire = option
  showCommanditaireOptions.value = false
}

const selectProducteur = (option) => {
  formData.value.producteur = option
  showProducteurOptions.value = false
}

const updateSelectedCollection = (selected) => {
  formData.value.selectedCollection = selected
}

const handleSubmit = () => {
  eventBus.emit('reset')

  const criteria = {
    yearMin: formData.value.yearMin,
    yearMax: formData.value.yearMax,
    scaleMin: formData.value.scaleMin,
    scaleMax: formData.value.scaleMax,
    commanditaire: formData.value.commanditaire,
    producteur: formData.value.producteur,
    selectedCollection: formData.value.selectedCollection.name === defaultCollection.name 
      ? null 
      : formData.value.selectedCollection.name
  }
  
  scanStore.updateCriteria(criteria)
}

const resetForm = () => {
  formData.value = {
    yearMin: '',
    yearMax: '',
    scaleMin: '500',
    scaleMax: '100000',
    commanditaire: '',
    producteur: '',
  }
  
  scanStore.resetCriteria()
  eventBus.emit('criteria-reset')
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

.half {
  flex: 1;
  min-width: calc(50% - 6px);
  max-width: calc(50% - 6px);
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

@media (max-width: 500px) {
  .form-row {
    flex-direction: column;
    gap: 15px;
  }

  .half {
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