<template>
  <div class="phototheque-submenu">
    <div class="mission-selection">
      <div class="selection-header">
        <label for="mission-select">Sélectionner une mission</label>
        <span class="mission-count">{{ missions.length }} missions trouvées</span>
      </div>
      <Dropdown
        :options="missions"
        disableOption="Choisissez une mission"
        @update:selected="handleMissionSelected"
      />
    </div>

    <div v-if="selectedMission" class="mission-preview slide-in">
      <div class="mission-card">
        <div class="preview-details">
          <div
            v-for="(detail, index) in essentialDetails"
            :key="index"
            class="detail-item"
            :style="{ 'animation-delay': `${index * 0.05}s` }"
          >
            <div class="detail-label">{{ detail.label }}</div>
            <div class="detail-value">{{ detail.value }}</div>
          </div>
        </div>

        <div class="action-buttons">
          <button class="view-details-button" @click="openModal">Voir tous les détails</button>
          <button class="download-button" @click="downloadDetails">Télécharger</button>
        </div>
      </div>
    </div>

    <div class="mission-options">
      <div class="options-label">Options de sélection</div>
      <div class="checkbox-group">
        <label v-for="(option, index) in checkboxOptions" :key="index" class="checkbox-label">
          <input type="checkbox" v-model="selectedOptions[option.key]" class="checkbox-input" />
          <span class="custom-checkbox"></span>
          {{ option.label }}
        </label>
      </div>
    </div>

    <div v-if="isModalOpen" class="modal-overlay" @click.self="closeModal">
      <MissionDetailsModal
        :isOpen="isModalOpen"
        :title="`${getMissionName()} - Détails complets`"
        :details="allMissionDetails"
        @close="closeModal"
        @download="downloadDetails"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import Dropdown from '../material/Dropdown.vue'
import MissionDetailsModal from './MissionDetailsModal.vue'
const missions = ref([
  { id: '1', name: 'Mission Alpha' },
  { id: '2', name: 'Mission Beta' },
  { id: '3', name: 'Mission Gamma' },
])

const allMissionDetails = reactive([
  { label: 'Désignation', value: 'NaN', essential: true },
  { label: 'Dispo Photothèque', value: 'NaN', essential: false },
  { label: 'Échelle', value: 'NaN', essential: false },
  { label: 'Format', value: 'NaN', essential: true },
  { label: 'Nombre de clichés', value: 'NaN', essential: true },
  { label: 'Support', value: 'NaN', essential: false },
  { label: 'Note', value: 'NaN', essential: false },
  { label: 'Disponibilité internet', value: 'NaN', essential: false },
  { label: 'Nom générique', value: 'NaN', essential: false },
  { label: 'Année', value: 'NaN', essential: true },
  { label: 'Numéro SAA', value: 'NaN', essential: false },
  { label: 'Thème', value: 'NaN', essential: false },
  { label: 'Thème géographique', value: 'NaN', essential: false },
  { label: 'Commanditaire', value: 'NaN', essential: false },
  { label: 'Producteur', value: 'NaN', essential: false },
  { label: 'Style', value: 'NaN', essential: false },
  { label: 'Émulsion', value: 'NaN', essential: false },
  { label: 'Qualité PDV', value: 'NaN', essential: false },
])

const essentialDetails = computed(() => {
  return allMissionDetails.filter((detail) => detail.essential)
})

const selectedMission = ref('')
const isModalOpen = ref(false)

const selectedOptions = reactive({
  couplesStereo: false,
  alphanumeric: false,
  popup: false,
  sheetNumber: false,
  countryName: false,
})

const checkboxOptions = [
  { key: 'couplesStereo', label: 'Couples Stéréo' },
  { key: 'alphanumeric', label: 'Alphanumérique' },
  { key: 'popup', label: 'Popup' },
  { key: 'sheetNumber', label: 'N° Feuille' },
  { key: 'countryName', label: 'Nom Pays' },
]

const openModal = () => {
  isModalOpen.value = true
  document.body.style.overflow = 'hidden'
}

const closeModal = () => {
  isModalOpen.value = false
  document.body.style.overflow = ''
}

const downloadDetails = () => {
  console.log('fonction dl')
}

const getMissionName = () => {
  const mission = missions.value.find((mission) => mission.id === selectedMission.value)
  return mission.name
}

const handleMissionSelected = (mission) => {
  selectedMission.value = mission.id
}
</script>

<style scoped>
@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.slide-in {
  animation: fadeIn 0.5s ease;
}

.phototheque-submenu {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  animation: fadeIn 0.3s ease;
  max-width: 800px;
  margin: 0 auto;
}

.mission-selection {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 20px;
}

.selection-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.mission-count {
  font-size: 13px;
  color: #666;
  background-color: #f5f5f5;
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: 500;
}

.mission-selection label {
  font-size: 14px;
  color: #555;
  font-weight: 500;
}

.input-group {
  display: flex;
  position: relative;
}

.mission-dropdown {
  flex: 1;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.mission-preview {
  margin-bottom: 20px;
}

.mission-card {
  background-color: white;
  border-radius: 8px;
  /* box-shadow: 0 4px 12px rgba(0,0,0,0.08); */
  border: 1px solid #ddd;
  overflow: hidden;
  transition: all 0.3s ease;
}

.mission-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background-color: #f8f9fa;
  border-bottom: 1px solid #eaeaea;
}

.mission-header h3 {
  margin: 0;
  color: #333;
  font-weight: 600;
  font-size: 16px;
}

.preview-details {
  padding: 16px 20px;
}

.detail-item {
  display: flex;
  margin-bottom: 10px;
  padding-bottom: 10px;
  border-bottom: 1px solid #f0f0f0;
  opacity: 0;
  animation: slideInRight 0.5s forwards;
}

.detail-item:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.detail-label {
  flex: 0 0 50%;
  font-weight: 500;
  color: #555;
  font-size: 14px;
}

.detail-value {
  flex: 0 0 60%;
  color: #333;
  font-size: 14px;
}

.action-buttons {
  display: flex;
  justify-content: space-between;
  padding: 16px 20px;
  border-top: 1px solid #eaeaea;
}

.view-details-button {
  background-color: #f8f9fa;
  color: #739614;
  border: 1px solid #ddd;
  padding: 10px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.view-details-button:hover {
  background-color: #edf2f7;
  border-color: #c4c4c4;
}

.download-button {
  background-color: #739614;
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  box-shadow: 0 2px 4px rgba(115, 150, 20, 0.2);
}

.download-button:hover {
  background-color: #658612;
}

.mission-options {
  margin-top: 20px;
}

.options-label {
  font-size: 14px;
  color: #555;
  font-weight: 500;
  margin-bottom: 12px;
}

.checkbox-group {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 12px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #444;
  cursor: pointer;
  user-select: none;
}

.checkbox-input {
  display: none;
}

.custom-checkbox {
  width: 18px;
  height: 18px;
  border: 2px solid #ddd;
  border-radius: 4px;
  display: inline-block;
  position: relative;
  transition: all 0.2s;
}

.checkbox-input:checked + .custom-checkbox {
  background-color: #739614;
  border-color: #739614;
}

.checkbox-input:checked + .custom-checkbox::after {
  content: '';
  position: absolute;
  left: 5px;
  top: 2px;
  width: 5px;
  height: 10px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  backdrop-filter: blur(3px);
}

.modal-container {
  background-color: white;
  border-radius: 8px;
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  animation: slideInUp 0.3s ease;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #eaeaea;
}

.modal-header h2 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.close-button {
  background: none;
  border: none;
  font-size: 24px;
  color: #777;
  cursor: pointer;
  transition: color 0.2s;
}

.close-button:hover {
  color: #333;
}

.modal-content {
  padding: 20px;
  overflow-y: auto;
  flex-grow: 1;
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.modal-detail-item {
  padding: 12px;
  border-radius: 6px;
  background-color: #f8f9fa;
  transition: all 0.2s;
}

.modal-detail-item:hover {
  background-color: #edf2f7;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 20px;
  border-top: 1px solid #eaeaea;
}

.close-modal-button {
  background-color: #f8f9fa;
  color: #666;
  border: 1px solid #ddd;
  padding: 10px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.close-modal-button:hover {
  background-color: #edf2f7;
  border-color: #c4c4c4;
}
</style>
