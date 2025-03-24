<!-- recherche par departement -->
<template>
  <div class="sub-category-content">
    <SubCategoryHeader title="Recherche par département" @close="$emit('close')" />
    <div class="search-form">
      <div class="form-group">
        <label for="departement-search">Nom ou code</label>
        <div class="input-group">
          <input
            id="departement-search"
            v-model="searchDepartement"
            type="text"
            placeholder="Ex: Rhône ou 69"
            @input="searchDepartements"
          />
          <button @click="searchDepartements">
            <i class="mdi mdi-magnify"></i>
          </button>
        </div>
      </div>
      <div class="results-container" v-if="departementResults.length > 0">
        <h5>Résultats ({{ departementResults.length }})</h5>
        <div class="results-list">
          <div
            v-for="dept in departementResults"
            :key="dept.code"
            class="result-item"
            @click="selectDepartement(dept)"
          >
            <div class="result-main">{{ dept.nom }}</div>
            <div class="result-secondary">{{ dept.code }} - {{ dept.region }}</div>
          </div>
        </div>
      </div>
      <div class="no-results" v-else-if="searchDepartement">Aucun département trouvé</div>
    </div>
    <CartothequeSubMenu />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import SubCategoryHeader from './SubCategoryHeader.vue'
import CartothequeSubMenu from './CartothequeSubMenu.vue'
import proj4 from 'proj4';

const emit = defineEmits(['close', 'select-departement'])
const searchDepartement = ref('')
const departementResults = ref([])
const showResults = ref(false)
let searchTimeout = null
const proj3857 = 'EPSG:3857';  // Web Mercator
const proj2154 = 'EPSG:2154';  // Lambert-93
import { useScanStore } from './store/scan';


const scanStore = useScanStore()

const handleClickOutside = (event) => {
  const resultsWrapper = document.querySelector('.results-wrapper')
  const searchInput = document.getElementById('departement-search')
  if (
    resultsWrapper &&
    !resultsWrapper.contains(event.target) &&
    event.target !== searchInput
  ) {
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

function create_bbox(contour) {
  if (!contour || contour.length === 0) {
    throw new Error("Contour invalide");
  }
  const coordinates = contour[0].map(point => [point[0], point[1]]);
  
  if (coordinates.length < 3) {
    throw new Error("Un polygone doit avoir au moins 3 points");
  }
  let minX = coordinates[0][0];
  let minY = coordinates[0][1];
  let maxX = coordinates[0][0];
  let maxY = coordinates[0][1];

  coordinates.forEach(point => {
    const [x, y] = point;
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);
  });

  return { minX, minY, maxX, maxY };
}

function convertBbox(bbox,proj_in,proj_out) {
  //Convertion Bbox de proj_in vers proj_out
  const minX = bbox.minX;
  const minY = bbox.minY;
  const maxX = bbox.maxX;
  const maxY = bbox.maxY;
  
  const minCoord = proj4(proj_in, proj_out, [minX, minY]);
  const maxCoord = proj4(proj_in, proj_out, [maxX, maxY]);

  return [
    minCoord[0],
    minCoord[1],
    maxCoord[0],
    maxCoord[1]
  ];
}



function searchDepartements() {
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }
  let url_dep;
  const query = searchDepartement.value.toLowerCase().trim();
  const numbner_dep = parseInt(query);
  if(!isNaN(numbner_dep )){
    url_dep = `https://geo.api.gouv.fr/departements?code=${query}&fields=nom,code,region`;
  }
  else{
    url_dep = `https://geo.api.gouv.fr/departements?nom=${query}&fields=nom,code,region`;
  }
  
  // ajout d'un setTimeout pour éviter les bugs de requetes et trop de requetes
  searchTimeout = setTimeout(() => {
    fetch(url_dep)
      .then(response => response.json())
      .then(data => {
        const newResults = data.map(departement => ({
          nom: departement.nom,
          code: departement.code,
          region: departement.region.nom
        }))
        departementResults.value = newResults
      })
      .catch(error => {
        console.error("Erreur lors de la récupération des departements:", error)
        departementResults.value = []
      })
  }, 300)
}

function selectDepartement(departement) {
  getDepartementBbox(departement).then((contour) => {
    let bbox3857 = create_bbox(contour);
    const bbox2154 = convertBbox(bbox3857,proj3857,proj2154);
    const point = {
      x: 0,
      y: 0,
      bboxLambert93: bbox2154
    }

    const coordinates = contour[0].map(point => [point[0], point[1]]);

    scanStore.updateCommuneContour(coordinates)

    emit('select-departement', point);
  }).catch((error) => {
    console.error('Erreur lors de la récupération des controus du departements:', error);
  });

  showResults.value = false;
}

async function getDepartementBbox(departement) {
  const depCode = departement.code.toString();
  const urlDepBbox = `http://localhost:8088/geoserver/wfs?service=wfs&version=2.0.0
  `+`&request=GetFeature&typeNames=departements&outputFormat=application/json&CQL_FILTER=CODE_DEPT='${depCode}'&srsName=EPSG:3857`;
  
  try {
    const response = await fetch(urlDepBbox);
    if (!response.ok) {
      throw new Error(`rrreur réseau : ${response.status}`);
    }
    const data = await response.json();
    const contour_dep = data.features[0]?.geometry?.coordinates[0];
    if (!contour_dep) {
      throw new Error('coordonées non trouvée dans la réponse');
    }
    return contour_dep;
  } catch (error) {
      console.error('e:', error);
    throw error;
  }
}




</script>

<style scoped>
.sub-category-content {
  animation: fadeIn 0.3s ease;
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
}

.form-group label {
  font-size: 14px;
  color: #555;
}

.input-group {
  display: flex;
}

.input-group input {
  flex: 1;
  padding: 10px;
  border: 1px solid #ddd;
  border-right: none;
  border-top-left-radius: 4px;
  border-bottom-left-radius: 4px;
  font-size: 14px;
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

.results-container {
  margin-top: 10px;
}

.results-container h5 {
  font-size: 14px;
  color: #555;
  margin-bottom: 10px;
}

.results-list {
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.result-item {
  padding: 10px;
  border-bottom: 1px solid #eee;
  cursor: pointer;
  transition: background-color 0.3s;
}

.result-item:last-child {
  border-bottom: none;
}

.result-item:hover {
  background-color: #f5f5f5;
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

.no-results {
  text-align: center;
  padding: 20px;
  color: #777;
  font-style: italic;
}
</style>
