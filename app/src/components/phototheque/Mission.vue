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
      <ShakingButton
        nameButton=""
        @click="setUrl"
        :disabled="!storeSelectedScan"
        v-if="!urlInDico"
        tooltip="Charger les clichés de la mission"
      >
        <template #icon>
          <SvgIcon type="mdi" :path="mdiPlus" class="mdicon" />
        </template>
      </ShakingButton>

      <ShakingButton
        nameButton=""
        @click="DeleteSelectedPhoto"
        :disabled="!storeSelectedScan"
        v-if="urlInDico"
        tooltip="Décharger les clichés de la mission"
      >
        <template #icon>
          <SvgIcon type="mdi" :path="mdiMinus" class="mdicon" />
        </template>
      </ShakingButton>

      <ShakingButton
        nameButton=""
        @click="DeletePhotoAll"
        :disabled="!storeSelectedScan"
        tooltip="Décharger tous les clichés"
      >
        <template #icon>
          <SvgIcon type="mdi" :path="mdiTrashCan" class="mdicon" />
        </template>
      </ShakingButton>

      <ShakingButton
        nameButton="CSV"
        @click="downloadCSV(storeScansData)"
        :disabled="!isDataAvailable > 0"
        tooltip="Télécharger les missions au format CSV"
      >
        <template #icon>
          <SvgIcon type="mdi" :path="mdiDownloadCircle" class="mdicon" />
        </template>
      </ShakingButton>

      <ShakingButton
        nameButton="XML"
        @click="downloadxml"
        :disabled="!storeSelectedScan"
        tooltip="Télécharger les métadonnées au format XML"
      >
        <template #icon>
          <SvgIcon type="mdi" :path="mdiXml" class="mdicon" />
        </template>
      </ShakingButton>

      <ShakingButton
        nameButton=""
        @click="clickedFlyTo"
        :disabled="!storeSelectedScan"
        tooltip="Centrer la carte sur cette mission"
      >
        <template #icon>
          <SvgIcon type="mdi" :path="mdiCrosshairsGps" class="mdicon" />
        </template>
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

      <div class="info-pva">
        <Accordeon title="Infos PVA" defaultOpen>
          <div class="mission-card" v-if="Object.keys(currentPhotoInfo).length !== 0">
            <div class="preview-details">
              <div
                v-for="(val, key, index) in currentPhotoInfo"
                :key="key"
                class="detail-item"
                :style="{ 'animation-delay': `${index * 0.05}s` }"
              >
                <div class="detail-label">{{ key }}</div>
                <div class="detail-value">{{ val }}</div>
              </div>
            </div>
          </div>
          <div v-else class="no-data">
            Veuillez survolée avec la souris un cliché pour voir ses informations
          </div>
        </Accordeon>
      </div>
    </div>

    <div v-if="isModalOpen" class="modal-overlay" @click.self="closeModal">
      <MissionDetailsModal
        :isOpen="isModalOpen"
        :title="`${missionName} - Détails complets`"
        :details="allDetails"
        @close="closeModal"
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
import Accordeon from '../material/Accordeon.vue'
import {
  mdiPlus,
  mdiMinus,
  mdiTrashCan,
  mdiDownloadCircle,
  mdiXml,
  mdiCrosshairsGps,
} from '@mdi/js'
import config from '@/config'

const scanStore = useScanStore()
const {
  storeScansData,
  storeSelectedScan,
  deletePhotoAllBool,
  dicoUrlPhoto,
  flyTo,
  activeTab,
  currentPhotoInfo,
} = storeToRefs(scanStore)

const selectedMission = computed(() => storeSelectedScan.value?.properties)
const missionName = computed(() => storeSelectedScan.value?.name)
const isDataAvailable = computed(() => storeScansData.value && storeScansData.value.length > 0)

const mtdURL = computed(() =>
  activeTab.value.includes('etranger') ? config.MTD_MONDE_URL : config.MTD_FRANCE_URL,
)

// real key : key bien écrit pour afficher dans modal
const all_keys = {
  nom: 'NOM',
  chantier: 'CHANTIER',
  numero_sa: 'NUMÉRO_SA',
  annee: 'ANNÉE',
  theme: 'THÈME',
  theme_ge: 'THÈME GÉNÉRAL',
  commandita: 'COMMANDITAIRE',
  producteur: 'PRODUCTEUR',
  style: 'STYLE',
  support: 'SUPPORT',
  emulsion: 'EMULTION',
  resolution: 'RÉSOLUTION',
  nombre_de_: 'NOMBRE DE PVA',
  qualite_p: 'QUALITÉ P',
  reference: 'RÉFÉRENCE',
  notes: 'NOTES',
  enveloppe_: 'ENVELOPPE',
  intersecte: 'INTERSECTE',
  dispo_phot: 'DISPO PHOTOTHEQUE',
  dispo_inte: 'DISPO INTERNET',
  designati: 'DÉSIGNATION',
  nom_gene: 'NOM GÉNÉRIQUE',
  identifian: 'IDENTIFIANT',
  format: 'FORMAT',
  focale: 'FOCALE',
  echelle: 'ECHELLE',
  territoire: 'TERRITOIRE',
}

const allDetails = computed(() => {
  const details = {}
  for (const key of Object.keys(all_keys)) {
    details[all_keys[key]] = !selectedMission.value?.[key]
      ? 'Pas de données'
      : selectedMission.value?.[key]
  }
  return details
})

const essential_keys = [
  'DÉSIGNATION',
  'DISPO PHOTOTHEQUE',
  'ECHELLE',
  'FORMAT',
  'NOMBRE DE PVA',
  'SUPPORT',
  'NOTES',
  'NOM GÉNÉRIQUE',
  'ANNÉE',
]

const essentialDetails = computed(() => {
  const details = {}
  for (const key of essential_keys) {
    details[key] = allDetails.value?.[key]
  }
  return details
})

const isModalOpen = ref(false)

/**
 * ouvre la modale
 */
const openModal = () => {
  isModalOpen.value = true
  document.body.style.overflow = 'hidden'
}

/**
 * ferme la modale
 */
const closeModal = () => {
  isModalOpen.value = false
  document.body.style.overflow = ''
}

/**
 * change l'url de la photo
 */
function setUrl() {
  if (storeSelectedScan.value) {
    const url = createUrlPhoto()
    scanStore.updateDicoUrlPhoto(url)
  }
}

/**
 * Supprime toutes les photos
 */
function DeletePhotoAll() {
  scanStore.updateDeletePhotoAllBool(!deletePhotoAllBool.value)
  dicoUrlPhoto.value = []
}

/**
 * Vérifie si l'url est dans le dictionnaire
 */
const urlInDico = computed(() => {
  if (!storeSelectedScan.value) return false
  const url = createUrlPhoto()
  return dicoUrlPhoto.value.includes(url)
})

/**
 * Crée l'url de la photo
 */
function createUrlPhoto() {
  if (!storeSelectedScan.value?.properties) return ''
  const annee = storeSelectedScan.value.properties.annee || ''
  const nom = storeSelectedScan.value.properties.chantier || ''
  const lieu = storeSelectedScan.value.properties.territoire || ''
  return `${mtdURL.value}${lieu}/${annee}/${nom}/${nom}.txt`
}

/**
 * Supprime l'url de la photo
 */
function DeleteSelectedPhoto() {
  const deleteUrl = createUrlPhoto()
  const index = dicoUrlPhoto.value.indexOf(deleteUrl)
  if (index > -1) {
    dicoUrlPhoto.value.splice(index, 1)
  }
}

let url_xml = ref(``)

/**
 * Télécharge le fichier XML
 */
function downloadxml() {
  if (!storeSelectedScan.value?.properties) return

  const info = storeSelectedScan.value?.properties
  const lieu = info.territoire
  url_xml = `${mtdURL.value}${lieu}/${info.annee}/${info.chantier}/${info.chantier}.xml`
  console.log('URL_XML : ', url_xml)
  window.open(url_xml, 'xml')
}

/**
 * Permet de se déplacer sur l'emprise de la mission
 */
function clickedFlyTo() {
  scanStore.updateFlyTo(!flyTo.value)
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

.no-data {
  text-align: center;
  padding: 20px;
  color: #666;
}

.info-pva {
  padding-bottom: 100px;
}

.group-button {
  display: flex;
  flex-direction: row;
  gap: 10px;
  margin-left: 5px;
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
  margin-bottom: 4px;
  padding-bottom: 4px;
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
  flex: 0 0 45%;
  font-weight: 500;
  color: #555;
  font-size: 11px;
}

.detail-value {
  flex: 0 0 60%;
  color: #333;
  font-size: 11px;
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
