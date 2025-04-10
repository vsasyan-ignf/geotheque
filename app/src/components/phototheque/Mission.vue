<template>
  <div class="phototheque-submenu">
    <div class="mission-selection">
      <div class="selection-header">
        <label for="mission-select">Sélectionner une mission</label>
        <span class="mission-count">{{ storeScansData?.length }} missions trouvées</span>
      </div>

      <Dropdown :options="storeScansData" disableOption="Choisissez une mission" />
    </div>

    <div class="group-button">
      <ShakingButton nameButton="" @click="setUrl" :disabled="!storeSelectedScan" v-if="!urlInDico">
        <template #icon>
          <SvgIcon type="mdi" :path="mdiPlus" class="mdicon" />
        </template>
      </ShakingButton>

      <ShakingButton
        nameButton=""
        @click="DeleteSelectedPhoto"
        :disabled="!storeSelectedScan"
        v-if="urlInDico"
      >
        <template #icon>
          <SvgIcon type="mdi" :path="mdiMinus" class="mdicon" />
        </template>
      </ShakingButton>

      <ShakingButton nameButton="" @click="DeletePhotoAll" :disabled="!storeSelectedScan">
        <template #icon>
          <SvgIcon type="mdi" :path="mdiTrashCan" class="mdicon" />
        </template>
      </ShakingButton>

      <ShakingButton
        nameButton="CSV"
        @click="downloadCSV(storeScansData)"
        :disabled="!isDataAvailable > 0"
      >
        <template #icon>
          <SvgIcon type="mdi" :path="mdiDownloadCircle" class="mdicon" />
        </template>
      </ShakingButton>

      <ShakingButton nameButton="XML" @click="downloadxml" :disabled="!storeSelectedScan">
        <template #icon><SvgIcon type="mdi" :path="mdiXml" class="mdicon" /></template>
      </ShakingButton>
    </div>

    <div v-if="selectedMission" class="mission-preview slide-in">
      <div class="mission-card">
        <div class="preview-details">
          <div
            v-for="(val, key, index) in essentialDetails"
            :key="key"
            class="detail-item"
            :style="{ 'animation-delay': `${index * 0.05}s` }"
          >
            <div class="detail-label">{{ key }}</div>
            <div class="detail-value">{{ val }}</div>
          </div>
        </div>

        <div class="action-buttons">
          <button class="view-details-button" @click="openModal">Voir tous les détails</button>
        </div>
      </div>
    </div>

    <div v-if="isModalOpen" class="modal-overlay" @click.self="closeModal">
      <MissionDetailsModal
        :isOpen="isModalOpen"
        :title="`${missionName} - Détails complets`"
        :details="allDetails"
        @close="closeModal"
        @download="downloadDetails"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import Dropdown from '@/components/material/Dropdown.vue'
import MissionDetailsModal from './MissionDetailsModal.vue'
import { useScanStore } from '@/components/store/scan'
import { storeToRefs } from 'pinia'
import { downloadCSV } from '../composable/download'
import ShakingButton from '@/components/material/ShakingButton.vue'
import { mdiPlus, mdiMinus, mdiTrashCan, mdiDownloadCircle, mdiXml } from '@mdi/js'
import config from '@/config'

const scanStore = useScanStore()
const { storeScansData, storeSelectedScan, deletePhotoAllBool, dicoUrlPhoto } =
  storeToRefs(scanStore)

const selectedMission = computed(() => storeSelectedScan.value?.properties)
const missionName = computed(() => storeSelectedScan.value?.name)
const isDataAvailable = computed(() => storeScansData.value && storeScansData.value.length > 0)

// real key : key bien écrit pour afficher dans modal
const all_keys = {
  nom: 'NOM',
  chantier: 'CHANTIER',
  numéro_sa: 'NUMÉRO_SA',
  année: 'ANNÉE',
  thème: 'THÈME',
  thème_gé: 'THÈME GÉNÉRAL',
  commandita: 'COMMANDITAIRE',
  producteur: 'PRODUCTEUR',
  style: 'STYLE',
  support: 'SUPPORT',
  emulsion: 'EMULTION',
  résolution: 'RÉSOLUTION',
  nombre_de_: 'NOMBRE DE PVA',
  qualité_p: 'QUALITÉ P',
  référence: 'RÉFÉRENCE',
  notes: 'NOTES',
  enveloppe_: 'ENVELOPPE',
  intersecte: 'INTERSECTE',
  dispo_phot: 'DISPO PHOTO',
  dispo_inte: 'DISPO INTER',
  désignati: 'DÉSIGNATION',
  nom_géné: 'NOM GÉNÉ',
  identifian: 'IDENTIFIANT',
  format: 'FORMAT',
  focale: 'FOCALE',
  echelle: 'ECHELLE',
}

const allDetails = computed(() => {
  const details = {}
  for (const key of Object.keys(all_keys)) {
    details[all_keys[key]] =
      selectedMission.value?.[key] === '' ? 'No data' : selectedMission.value?.[key]
  }
  return details
})

const essential_keys = ['DÉSIGNATION', 'FORMAT', 'ANNÉE', 'NOMBRE DE PVA']

const essentialDetails = computed(() => {
  const details = {}
  for (const key of essential_keys) {
    details[key] = allDetails.value?.[key]
  }
  return details
})

const isModalOpen = ref(false)

const openModal = () => {
  isModalOpen.value = true
  document.body.style.overflow = 'hidden'
}

const closeModal = () => {
  isModalOpen.value = false
  document.body.style.overflow = ''
}

function setUrl() {
  if (storeSelectedScan.value) {
    const url = createUrlPhoto()
    scanStore.updateUrlPhoto(url)
    scanStore.updateDicoUrlPhoto(url)
  }
}

function DeletePhotoAll() {
  scanStore.updateDeletePhotoAllBool(!deletePhotoAllBool.value)
  dicoUrlPhoto.value = []
}

const urlInDico = computed(() => {
  if (!storeSelectedScan.value) return false
  const url = createUrlPhoto()
  return dicoUrlPhoto.value.includes(url)
})

function createUrlPhoto() {
  const annee = storeSelectedScan.value.properties.annee
  const nom = storeSelectedScan.value.properties.chantier
  return `${config.MTD_FRANCE_URL}Lambert93/${annee}/${nom}/${nom}.txt`
}

function DeleteSelectedPhoto() {
  const deleteUrl = createUrlPhoto()
  const index = dicoUrlPhoto.value.indexOf(deleteUrl)
  if (index > -1) {
    dicoUrlPhoto.value.splice(index, 1)
  }
}

let url_xml = ref(``)

function downloadxml() {
  if (storeSelectedScan.value) {
    const info = storeSelectedScan.value?.properties
    console.log('info : ', info)
    const lieu = 'Lambert93'
    url_xml = `${config.MTD_FRANCE_URL}${lieu}/${info.annee}/${info.chantier}/${info.chantier}.xml`
    console.log('URL_XML : ', url_xml)
    window.open(url_xml, 'xml')
  }
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

.group-button {
  display: flex;
  flex-direction: row;
  gap: 10px;
  margin-left: 10px;
  margin-bottom: 20px;
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
  margin-bottom: 100px;
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
  margin-bottom: 8px;
  padding-bottom: 8px;
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
  font-size: 12px;
}

.detail-value {
  flex: 0 0 60%;
  color: #333;
  font-size: 12px;
}

.action-buttons {
  display: flex;
  justify-content: space-between;
  padding: 10px 20px;
  border-top: 1px solid #eaeaea;
}

.view-details-button {
  background-color: #f8f9fa;
  color: #739614;
  border: 1px solid #ddd;
  padding: 10px 16px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.view-details-button:hover {
  background-color: #edf2f7;
  border-color: #c4c4c4;
}

.mission-options {
  margin-top: 20px;
  margin-bottom: 40px;
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
