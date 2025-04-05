<template>
  <div class="sub-category-content">
    <SubCategoryHeader title="Recherche par feuilles" @close="$emit('close')" />
    <div class="search-form">
      <div class="form-group">
        <label for="feuille-search">Numero</label>
        <div class="input-group">
          <input
            id="feuille-search"
            autocomplete="off"
            v-model="feuilleSelected"
            type="text"
            placeholder="Ex: NE 28 XVIII ou 1911"
            @input="searchFeuille"
            @focus="showResults = true"
          />
          <button @click="validateFeuille">
            <SvgIcon :path="mdiMagnify" type="mdi" class="mdi" />
          </button>
        </div>

        <div class="results-wrapper" v-if="showResults">
          <div class="results-header">
            <h5 v-if="feuilleResults.length > 0">Résultats ({{ feuilleResults.length }})</h5>
            <h5 v-else-if="feuilleSelected">Aucun résultat</h5>
            <h5 v-else>Commencez à taper pour rechercher</h5>
            <button class="close-results" @click="showResults = false">
              <SvgIcon :path="mdiClose" type="mdi" class="mdi" />
            </button>
          </div>

          <div class="results-content">
            <div class="results-list" v-if="feuilleResults.length > 0">
              <div
                v-for="(feuille, index) in feuilleResults"
                :key="feuille.nom + '-' + index"
                class="result-item"
                @click="selectFeuille(feuille)"
              >
                <div class="result-content">
                  <div class="result-main">{{ feuille.numero }}</div>
                  <div class="result-secondary">Nom de la feuille : {{ feuille.nom }}</div>
                </div>
              </div>
            </div>

            <div class="no-results" v-else-if="feuilleSelected">
              <SvgIcon :path="mdiAlertCircleOutline" type="mdi" class="mdi" />
              <span>Aucune feuilles trouvées</span>
            </div>

            <div class="empty-search" v-else>
              <SvgIcon :path="mdiMapSearchOutline" type="mdi" class="mdi" />
              <span>Saisissez le numéro d'une feuille</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <CartothequeSubMenu v-if="activeTab === 'cartotheque_etranger'" />
    <PhotothequeSubMenu v-else-if="activeTab === 'phototheque'" />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import SubCategoryHeader from './SubCategoryHeader.vue'
import CartothequeSubMenu from '@/components/cartotheque/CartothequeSubMenu.vue'
import PhotothequeSubMenu from '@/components/phototheque/PhotothequeSubMenu.vue'
import { useScanStore } from '@/components/store/scan'
import { storeToRefs } from 'pinia'
import { mdiMapSearchOutline, mdiAlertCircleOutline, mdiClose, mdiMagnify } from '@mdi/js'
import { create_bbox, useConvertCoordinates } from '@/components/composable/convertCoordinates'
import config from '@/config'

const scanStore = useScanStore()
const { activeTab } = storeToRefs(scanStore)

const emit = defineEmits(['close', 'select-commune'])

const feuilleSelected = ref('')
const feuilleResults = ref([])
const showResults = ref(false)
let searchTimeout = null
let repFeuille = ref(null)

const feuilleWFS = computed(() => {
  if (activeTab.value === 'phototheque') {
    return 'feuilles50000'
  } else {
    return 'feuillesmonde'
  }
})

const proj = computed(() => {
  return feuilleWFS.value === 'feuillesmonde' ? 'EPSG:4326' : 'EPSG:2154'
})

const handleClickOutside = (event) => {
  const resultsWrapper = document.querySelector('.results-wrapper')
  const searchInput = document.getElementById('feuille-search')

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

function searchFeuille() {
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }

  const query = feuilleSelected.value

  if (!query) {
    feuilleResults.value = []
    return
  }

  showResults.value = true

  // ajout d'un setTimeout pour éviter les bugs de requetes et trop de requetes
  let search_url = ''
  searchTimeout = setTimeout(() => {
    search_url = `${config.GEOSERVER_URL}/wfs?service=wfs&version=2.0.0&request=GetFeature&typeNames=${feuilleWFS.value}&outputFormat=application/json&CQL_FILTER=NUMERO%20LIKE%20%27${query}%25%27`
    fetch(search_url)
      .then((response) => response.json())
      .then((data) => {
        const newResults = data.features.map((feuille) => ({
          nom: feuille.properties.NOM,
          numero: feuille.properties.NUMERO,
          geometry: feuille.geometry.coordinates[0][0],
        }))
        feuilleResults.value = newResults
      })
      .catch((error) => {
        console.error('Erreur lors de la récupération des feuilles:', error)
        feuilleResults.value = []
      })
  }, 300)
}

function selectFeuille(feuille) {
  feuilleSelected.value = feuille.numero
  repFeuille.value = feuille
  validateFeuille()
  showResults.value = false
}

function validateFeuille() {
  if (repFeuille) {
    const bbox4326 = create_bbox([repFeuille.value.geometry])
    const bboxLonLat = [bbox4326.minX, bbox4326.minY, bbox4326.maxX, bbox4326.maxY]
    scanStore.updateBbox(bboxLonLat)

    const contourMercator = repFeuille.value.geometry.map((coord) =>
      useConvertCoordinates(coord[0], coord[1], proj.value, 'EPSG:3857'),
    )
    scanStore.updateSelectedGeom(contourMercator)
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
</style>
