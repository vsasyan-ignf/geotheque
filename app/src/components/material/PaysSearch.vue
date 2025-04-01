<!-- recherche par pays -->
<template>
  <div class="sub-category-content">
    <SubCategoryHeader title="Recherche par pays" @close="$emit('close')" />
    <div class="search-form">
      <div class="form-group">
        <label for="country-search">Nom du pays</label>
        <div class="input-group">
          <input
            id="country-search"
            v-model="searchCountry"
            type="text"
            placeholder="Ex: France, Allemagne..."
            @input="searchCountries"
            @focus="showResults = true"
          />
          <button @click="searchCountries">
            <SvgIcon :path="mdiMagnify" type="mdi" class="mdi" />
          </button>
        </div>

        <div class="results-wrapper" v-if="showResults">
          <div class="results-header">
            <h5 v-if="countryResults.length > 0">Résultats ({{ countryResults.length }})</h5>
            <h5 v-else-if="searchCountry">Aucun résultat</h5>
            <h5 v-else>Commencez à taper pour rechercher</h5>
            <button class="close-results" @click="showResults = false">
              <SvgIcon :path="mdiClose" type="mdi" class="mdi" />
            </button>
          </div>

          <div class="results-content">
            <div class="results-list" v-if="countryResults.length > 0">
              <div
                v-for="country in countryResults"
                :key="country.code"
                class="result-item"
                @click="selectCountry(country)"
              >
                <div class="result-content">
                  <div class="result-main">{{ country.nom }}</div>
                  <div class="result-secondary">{{ country.code }}</div>
                </div>
              </div>
            </div>

            <div class="no-results" v-else-if="searchCountry">
              <SvgIcon :path="mdiAlertCircleOutline" type="mdi" class="mdi" />
              <span>Aucun pays trouvé</span>
            </div>

            <div class="empty-search" v-else>
              <SvgIcon :path="mdiMapSearchOutline" type="mdi" class="mdi" />
              <span>Saisissez le nom d'un pays</span>
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
import CartothequeSubMenu from '@/components/cartotheque/CartothequeSubMenu.vue'
import { mdiMapSearchOutline, mdiAlertCircleOutline, mdiClose, mdiMagnify } from '@mdi/js'
import { create_multibbox, convertBbox, getDynamicTolerance, roundCoordinates, createRealContour } from '../composable/convertCoordinates'
import config from '@/config'
import { useScanStore } from '@/components/store/scan'





const emit = defineEmits(['close', 'select-country'])
const searchCountry = ref('')
const countryResults = ref([])
const showResults = ref(false)
let searchTimeout = null


const scanStore = useScanStore()

const handleClickOutside = (event) => {
  const resultsWrapper = document.querySelector('.results-wrapper')
  const searchInput = document.getElementById('country-search')
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

function searchCountries() {
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }

  const query = searchCountry.value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()

  const url = `${config.GEOSERVER_URL}/wfs?service=wfs&version=2.0.0&request=GetFeature&typeNames=pays&outputFormat=application/json&CQL_FILTER=NOM%20LIKE%20%27${query}%25%27`

  searchTimeout = setTimeout(() => {
    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        const newResults = data.features.map((pays) => ({
          nom: pays.properties.NOM,
          code: pays.properties.CODE_PAYS,
        }))
        countryResults.value = newResults
      })
      .catch((error) => {
        console.error('Erreur lors de la récupération des pays:', error)
        countryResults.value = []
      })
  }, 500)
}

function getLongestSubArray(arr) {
    return arr.reduce((longest, current) => 
        current.length > longest.length ? current : longest
    , []);
}



function selectCountry(country) {
  getCountryBbox(country)
    .then((contour) => {
      
      const bbox3857 = create_multibbox(contour)
      const bbox4326 = convertBbox(bbox3857, 'EPSG:3857', 'EPSG:4326')
      
      scanStore.updateBbox(bbox4326)
      scanStore.updateSelectedGeom(contour)

      if (contour.length > 10) {
        const longestSubArray = getLongestSubArray(contour)
        contour =[longestSubArray]
      }

      

      if (country.code === "US"){
        contour = [[["-13912762.1682", "2915614.0653"], ["-13912762.1682", "6261721.3124"], ["-7396658.4088", "6261721.3124"], ["-7396658.4088", "2915614.0653"], ["-13912762.1682", "2915614.0653"]]]
      }

      scanStore.updateWKT(createRealContour(contour))
    })
    .catch((error) => {
      console.error('Erreur lors de la récupération des contours du pays:', error)
    })

  showResults.value = false
}

async function getCountryBbox(country) {
  const countryCode = country.code
    .split(',')[0]
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()


  const urlCountryBbox =
    `${config.GEOSERVER_URL}/wfs?service=wfs&version=2.0.0` +
    `&request=GetFeature&typeNames=pays&outputFormat=application/json` +
    `&CQL_FILTER=CODE_PAYS='${countryCode}'&srsName=EPSG:3857`
  

  try {
    const response = await fetch(urlCountryBbox)
    if (!response.ok) {
      throw new Error(`Erreur réseau : ${response.status}`)
    }
    const data = await response.json()

    const contour_country = data.features[0]?.geometry?.coordinates

    if (!contour_country) {
      throw new Error('Coordonnées non trouvées dans la réponse')
    }
    const allContours = []

    for (const polygon of contour_country) {
      const exteriorRing = polygon[0]

      allContours.push(exteriorRing)
    }

    return allContours
  } catch (error) {
    console.error('Erreur:', error)
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
