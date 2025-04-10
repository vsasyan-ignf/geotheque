<!-- recherche par departement -->
<template>
  <div class="sub-category-content">
    <SubCategoryHeader title="Recherche par département" @close="$emit('close')" />
    <div class="search-form">
      <div class="form-group">
        <label for="departement-search">Nom ou numéro</label>
        <div class="input-group">
          <input
            id="departement-search"
            v-model="searchDepartement"
            type="text"
            placeholder="Ex: Rhône ou 69"
            @input="searchDepartements"
            @focus="showResults = true"
          />
          <button @click="searchDepartements">
            <SvgIcon :path="mdiMagnify" type="mdi" class="mdi" />
          </button>
        </div>

        <div class="results-wrapper" v-if="showResults">
          <div class="results-header">
            <h5 v-if="departementResults.length > 0">
              Résultats ({{ departementResults.length }})
            </h5>
            <h5 v-else-if="searchDepartement">Aucun résultat</h5>
            <h5 v-else>Commencez à taper pour rechercher</h5>
            <button class="close-results" @click="showResults = false">
              <SvgIcon :path="mdiClose" type="mdi" class="mdi" />
            </button>
          </div>

          <div class="results-content">
            <div class="results-list" v-if="departementResults.length > 0">
              <div
                v-for="dept in departementResults"
                :key="dept.code"
                class="result-item"
                @click="selectDepartement(dept)"
              >
                <div class="result-content">
                  <div class="result-main">{{ dept.nom }}</div>
                  <div class="result-secondary">{{ dept.code }} - {{ dept.region }}</div>
                </div>
              </div>
            </div>

            <div class="no-results" v-else-if="searchDepartement">
              <SvgIcon :path="mdiAlertCircleOutline" type="mdi" class="mdi" />
              <span>Aucun Département trouvée</span>
            </div>

            <div class="empty-search" v-else>
              <SvgIcon :path="mdiMapSearchOutline" type="mdi" class="mdi" />
              <span>Saisissez le nom ou code d'un Département</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <CartothequeSubMenu v-if="activeTab === 'cartotheque'" />
    <PhotothequeSubMenu v-else-if="activeTab === 'phototheque'" />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import SubCategoryHeader from './SubCategoryHeader.vue'
import CartothequeSubMenu from '@/components/cartotheque/CartothequeSubMenu.vue'
import PhotothequeSubMenu from '@/components/phototheque/PhotothequeSubMenu.vue'
import { mdiMapSearchOutline, mdiAlertCircleOutline, mdiClose, mdiMagnify } from '@mdi/js'

import { useScanStore } from '@/components/store/scan'
import { convertBbox, create_bbox } from '@/components/composable/convertCoordinates'
import config from '@/config'
import { storeToRefs } from 'pinia'

const emit = defineEmits(['close', 'select-departement'])
const searchDepartement = ref('')
const departementResults = ref([])
const showResults = ref(false)
let searchTimeout = null
const proj3857 = 'EPSG:3857' // Web Mercator
const proj2154 = 'EPSG:2154' // Lambert-93

const scanStore = useScanStore()
const { activeTab } = storeToRefs(scanStore)

const handleClickOutside = (event) => {
  const resultsWrapper = document.querySelector('.results-wrapper')
  const searchInput = document.getElementById('departement-search')
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

function searchDepartements() {
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }
  let url_dep
  const query = searchDepartement.value.toLowerCase().trim()
  const numbner_dep = parseInt(query)
  if (!isNaN(numbner_dep)) {
    url_dep = `${config.DEPARTEMENT_URL}?code=${query}&fields=nom,code,region`
  } else {
    url_dep = `${config.DEPARTEMENT_URL}?nom=${query}&fields=nom,code,region`
  }

  // ajout d'un setTimeout pour éviter les bugs de requetes et trop de requetes
  searchTimeout = setTimeout(() => {
    fetch(url_dep)
      .then((response) => response.json())
      .then((data) => {
        const newResults = data.map((departement) => ({
          nom: departement.nom,
          code: departement.code,
          region: departement.region.nom,
        }))
        departementResults.value = newResults
      })
      .catch((error) => {
        console.error('Erreur lors de la récupération des departements:', error)
        departementResults.value = []
      })
  }, 300)
}

function selectDepartement(departement) {
  getDepartementBbox(departement)
    .then((contour) => {
      let bbox3857 = create_bbox(contour)
      const bbox2154 = convertBbox(bbox3857, proj3857, proj2154)
      const point = {
        x: 0,
        y: 0,
        bboxLambert93: bbox2154,
      }

      const coordinates = contour[0].map((point) => [point[0], point[1]])

      scanStore.updateSelectedGeom([coordinates])

      emit('select-departement', point)
    })
    .catch((error) => {
      console.error('Erreur lors de la récupération des controus du departements:', error)
    })
  searchDepartement.value = departement.nom
  showResults.value = false
}

async function getDepartementBbox(departement) {
  const depCode = departement.code.toString()
  const urlDepBbox =
    `${config.GEOSERVER_URL}` +
    `&request=GetFeature&typeNames=geotheque_mtd:france_departements&outputFormat=application/json&CQL_FILTER=code_dept='${depCode}'&apikey=${config.APIKEY}`

  try {
    const response = await fetch(urlDepBbox)
    if (!response.ok) {
      throw new Error(`rrreur réseau : ${response.status}`)
    }
    const data = await response.json()
    const contour_dep = data.features[0]?.geometry?.coordinates[0]
    if (!contour_dep) {
      throw new Error('coordonées non trouvée dans la réponse')
    }
    console.log('Contour du departement:', contour_dep)
    return contour_dep
  } catch (error) {
    console.error('e:', error)
    throw error
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
