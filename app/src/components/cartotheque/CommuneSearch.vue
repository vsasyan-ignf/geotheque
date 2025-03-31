<template>
  <div class="sub-category-content">
    <SubCategoryHeader title="Recherche par commune" @close="$emit('close')" />
    <div class="search-form">
      <div class="form-group">
        <label for="commune-search">Nom ou code postal</label>
        <div class="input-group">
          <input
            id="commune-search"
            autocomplete="off"
            v-model="searchCommune"
            type="text"
            placeholder="Ex: Paris ou 75000"
            @input="searchCommunes"
            @focus="showResults = true"
          />
          <button @click="validateCommune">
            <SvgIcon :path="mdiMagnify" type="mdi" class="mdi" />
          </button>
        </div>

        <div class="results-wrapper" v-if="showResults">
          <div class="results-header">
            <h5 v-if="communeResults.length > 0">Résultats ({{ communeResults.length }})</h5>
            <h5 v-else-if="searchCommune">Aucun résultat</h5>
            <h5 v-else>Commencez à taper pour rechercher</h5>
            <button class="close-results" @click="showResults = false">
              <SvgIcon :path="mdiClose" type="mdi" class="mdi" />
            </button>
          </div>

          <div class="results-content">
            <div class="results-list" v-if="communeResults.length > 0">
              <div
                v-for="(commune, index) in communeResults"
                :key="commune.code + '-' + commune.nom"
                class="result-item"
                @click="selectCommune(commune)"
              >
                <div class="result-content">
                  <div class="result-main">{{ commune.nom }}</div>
                  <div class="result-secondary">{{ commune.code }} - {{ commune.departement }}</div>
                </div>
              </div>
            </div>

            <div class="no-results" v-else-if="searchCommune">
              <SvgIcon :path="mdiAlertCircleOutline" type="mdi" class="mdi" />
              <span>Aucune commune trouvée</span>
            </div>

            <div class="empty-search" v-else>
              <SvgIcon :path="mdiMapSearchOutline" type="mdi" class="mdi" />
              <span>Saisissez le nom ou code postal d'une commune</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <CartothequeSubMenu />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import SubCategoryHeader from './SubCategoryHeader.vue'
import CartothequeSubMenu from './CartothequeSubMenu.vue'
import { useConvertCoordinates } from '@/components/composable/convertCoordinates'
import { useScanStore } from '@/components/store/scan'
import { mdiMapSearchOutline, mdiAlertCircleOutline, mdiClose, mdiMagnify } from '@mdi/js'

import config from '@/config'

const scanStore = useScanStore()

const emit = defineEmits(['close', 'select-commune'])

let searchCommune = ref('')
const communeResults = ref([])
const showResults = ref(false)
let searchTimeout = null
let repCommune = ref(null)

const handleClickOutside = (event) => {
  const resultsWrapper = document.querySelector('.results-wrapper')
  const searchInput = document.getElementById('commune-search')

  if (resultsWrapper && !resultsWrapper.contains(event.target) && event.target !== searchInput) {
    showResults.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  if (searchTimeout) clearTimeout(searchTimeout)
})

function searchCommunes() {
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }

  const query = searchCommune.value.toLowerCase().trim()

  if (!query) {
    communeResults.value = []
    return
  }

  showResults.value = true

  // ajout d'un setTimeout pour éviter les bugs de requetes et trop de requetes
  let search_url = ''
  searchTimeout = setTimeout(() => {
    if (parseInt(query)) {
      search_url = `${config.COMMUNE_URL}?codePostal=${query}&fields=nom,codesPostaux,departement,bbox,contour`
    } else {
      search_url = `${config.COMMUNE_URL}?nom=${query}&fields=nom,codesPostaux,departement,bbox,contour`
    }

    fetch(search_url)
      .then((response) => response.json())
      .then((data) => {
        const newResults = data.map((commune) => ({
          nom: commune.nom,
          code: commune.codesPostaux[0],
          departement: commune.departement.nom,
          bbox: commune.bbox,
          contour: commune.contour,
        }))

        communeResults.value = newResults
      })
      .catch((error) => {
        console.error('Erreur lors de la récupération des communes:', error)
        communeResults.value = []
      })
  }, 300)
}

function selectCommune(commune) {
  searchCommune.value = commune.nom
  repCommune = commune
  validateCommune()
  showResults.value = false
}

function validateCommune() {
  if (repCommune) {
    const bbox = repCommune.bbox.coordinates[0]
    const bboxWGS84 = [bbox[0], bbox[2]]
    const bboxLambert93 = bboxWGS84.map((point) =>
      useConvertCoordinates(point[0], point[1], 'EPSG:4326', 'EPSG:2154'),
    )

    const point = {
      x: 0,
      y: 0,
      bboxLambert93: bboxLambert93.flat(),
    }

    const contourMercator = repCommune.contour.coordinates[0].map((coord) =>
      useConvertCoordinates(coord[0], coord[1], 'EPSG:4326', 'EPSG:3857'),
    )

    scanStore.updateSelectedGeom(contourMercator)

    emit('select-commune', point)
  }
}
</script>

<style scoped>
.sub-category-content {
  animation: fadeIn 0.3s ease;
  position: relative;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.search-form {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
  position: relative;
}

.form-group label {
  font-size: 14px;
  color: #555;
  font-weight: 500;
}

.input-group {
  display: flex;
  position: relative;
  z-index: 2;
}

.input-group input {
  flex: 1;
  padding: 12px;
  border: 1px solid #ddd;
  border-right: none;
  border-top-left-radius: 4px;
  border-bottom-left-radius: 4px;
  font-size: 14px;
  transition:
    border-color 0.3s,
    box-shadow 0.3s;
}

.input-group input:focus {
  outline: none;
  border-color: #739614;
  box-shadow: 0 0 0 2px rgba(115, 150, 20, 0.1);
}

.input-group button {
  padding: 0 15px;
  background-color: #739614;
  color: white;
  border: none;
  border-top-right-radius: 4px;
  border-bottom-right-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.input-group button:hover {
  background-color: #5e7a10;
}

.results-wrapper {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 2px;
  background-color: white;
  border-radius: 6px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.15);
  z-index: 10;
  max-height: 350px;
  overflow: hidden;
  animation: slideDown 0.2s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 15px;
  border-bottom: 1px solid #eee;
  background-color: #f9f9f9;
}

.results-header h5 {
  font-size: 14px;
  color: #555;
  margin: 0;
}

.close-results {
  background: none;
  border: none;
  color: #777;
  cursor: pointer;
  font-size: 16px;
  padding: 3px;
  transition: color 0.2s;
}

.close-results:hover {
  color: #333;
}

.results-content {
  position: relative;
  min-height: 100px;
}

.results-list {
  max-height: 300px;
  overflow-y: auto;
  scrollbar-width: thin;
}

.results-list::-webkit-scrollbar {
  width: 4px;
}

.results-list::-webkit-scrollbar-thumb {
  background-color: #ddd;
  border-radius: 4px;
}

.result-item {
  padding: 12px 15px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: background-color 0.2s;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.result-item:last-child {
  border-bottom: none;
}

.result-item:hover {
  background-color: #f7f9f2;
}

.result-item:hover .result-icon {
  opacity: 1;
}

.result-content {
  flex: 1;
}

.result-main {
  font-weight: 500;
  color: #333;
}

.result-secondary {
  font-size: 12px;
  color: #777;
  margin-top: 3px;
}

.no-results,
.empty-search {
  text-align: center;
  padding: 25px;
  color: #777;
  font-style: italic;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.no-results i,
.empty-search i {
  font-size: 24px;
  color: #ddd;
}

.mdi {
  margin-top: 5px;
}
</style>
