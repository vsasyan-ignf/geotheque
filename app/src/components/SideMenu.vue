<template>
  <div class="sidebar-container">
    <div class="sidebar-tabs">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        :class="['tab-button', { active: activeTab === tab.id }]"
        @click="toggleTab(tab.id)"
        @mousedown="hideTooltip(tab)"
        @mouseenter="tab.showTooltip = true"
        @mouseleave="tab.showTooltip = false"
        :title="tab.title"
      >
        <i :class="'mdi mdi-' + tab.icon + ' icon-large'"></i>
        <div class="tooltip" v-show="activeTab !== tab.id">{{ tab.title }}</div>
      </button>
    </div>

    <div class="sidebar-content" :class="{ open: isSidebarOpen }">
      <div v-if="activeTab === 'carthotheque'" class="tab-content">
        <h3>{{ tabs.find((tab) => tab.id === activeTab)?.title }}</h3>

        <div v-if="!activeSubCategory" class="sub-categories">
          <div
            v-for="sub in subCategories"
            :key="sub.id"
            class="sub-category"
            @click="selectSubCategory(sub.id)"
          >
            <i :class="'mdi mdi-' + sub.icon"></i>
            <span>{{ sub.title }}</span>
          </div>
        </div>

        <!-- Contenu pour la sous-catégorie Commune -->
        <div v-if="activeSubCategory === 'commune'" class="sub-category-content">
          <div class="sub-category-header">
            <button class="back-button" @click="closeSubCategory">
              <i class="mdi mdi-arrow-left"></i>
            </button>
            <h4>Recherche par commune</h4>
          </div>

          <div class="search-form">
            <div class="form-group">
              <label for="commune-search">Nom ou code postal</label>
              <div class="input-group">
                <input
                  id="commune-search"
                  v-model="searchCommune"
                  type="text"
                  placeholder="Ex: Paris ou 75000"
                  @input="searchCommunes"
                />
                <button @click="searchCommunes">
                  <i class="mdi mdi-magnify"></i>
                </button>
              </div>
            </div>

            <div class="results-container" v-if="communeResults.length > 0">
              <h5>Résultats ({{ communeResults.length }})</h5>
              <div class="results-list">
                <div
                  v-for="commune in communeResults"
                  :key="commune.code"
                  class="result-item"
                  @click="goToCommune(commune)"
                >
                  <div class="result-main">{{ commune.nom }}</div>
                  <div class="result-secondary">{{ commune.code }} - {{ commune.departement }}</div>
                </div>
              </div>
            </div>

            <div class="no-results" v-else-if="searchCommune">Aucune commune trouvée</div>
          </div>
        </div>

        <div v-if="activeSubCategory === 'departement'" class="sub-category-content">
          <div class="sub-category-header">
            <button class="back-button" @click="closeSubCategory">
              <i class="mdi mdi-arrow-left"></i>
            </button>
            <h4>Recherche par département</h4>
          </div>

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
                  @click="goToDepartement(dept)"
                >
                  <div class="result-main">{{ dept.nom }}</div>
                  <div class="result-secondary">{{ dept.code }} - {{ dept.region }}</div>
                </div>
              </div>
            </div>

            <div class="no-results" v-else-if="searchDepartement">Aucun département trouvé</div>
          </div>
        </div>

        <div v-if="activeSubCategory === 'point'" class="sub-category-content">
          <div class="sub-category-header">
            <button class="back-button" @click="closeSubCategory">
              <i class="mdi mdi-arrow-left"></i>
            </button>
            <h4>Recherche par coordonnées</h4>
          </div>

          <div class="search-form">
            <div class="form-group">
              <label for="point-x">Coordonnée X</label>
              <input id="point-x" v-model="pointX" type="number" placeholder="Ex: 260000" />
            </div>

            <div class="form-group">
              <label for="point-y">Coordonnée Y</label>
              <input id="point-y" v-model="pointY" type="number" placeholder="Ex: 6000000" />
            </div>

            <div class="form-group">
              <label for="projection">Système de projection</label>
              <select id="projection" v-model="selectedProjection">
                <option v-for="proj in projections" :key="proj.id" :value="proj.id">
                  {{ proj.name }} ({{ proj.id }})
                </option>
              </select>
            </div>

            <button class="action-button" @click="goToPoint">
              <i class="mdi mdi-crosshairs-gps"></i>
              Centrer sur ce point
            </button>
          </div>
        </div>
      </div>

      <div v-if="activeTab === 'carthotheque_etranger'" class="tab-content">
        <h3>{{ tabs.find((tab) => tab.id === activeTab)?.title }}</h3>
      </div>
      <div v-if="activeTab === 'phototheque'" class="tab-content">
        <h3>{{ tabs.find((tab) => tab.id === activeTab)?.title }}</h3>
      </div>
      <div v-if="activeTab === 'phototheque_etranger'" class="tab-content">
        <h3>{{ tabs.find((tab) => tab.id === activeTab)?.title }}</h3>
      </div>
      <div v-if="activeTab === 'aide'" class="tab-content">
        <h3>{{ tabs.find((tab) => tab.id === activeTab)?.title }}</h3>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const activeTab = ref('carthotheque')
const isSidebarOpen = ref(true)
const activeSubCategory = ref(null)

const tabs = [
  { id: 'carthotheque', icon: 'layers', title: 'Cartothèque France' },
  { id: 'carthotheque_etranger', icon: 'file', title: 'Cartothèque Étranger' },
  { id: 'phototheque', icon: 'database', title: 'Photothèque France' },
  { id: 'phototheque_etranger', icon: 'database', title: 'Photothèque Étranger' },
  { id: 'aide', icon: 'database', title: 'Aide' },
]

const subCategories = [
  { id: 'commune', icon: 'city', title: 'Commune' },
  { id: 'departement', icon: 'map', title: 'Département' },
  { id: 'point', icon: 'crosshairs-gps', title: 'Point XY' },
]

const communes = ref([
  { nom: 'Paris', code: '75000', departement: 'Paris' },
  { nom: 'Lyon', code: '69000', departement: 'Rhône' },
  { nom: 'Marseille', code: '13000', departement: 'Bouches-du-Rhône' },
  { nom: 'Toulouse', code: '31000', departement: 'Haute-Garonne' },
  { nom: 'Nice', code: '06000', departement: 'Alpes-Maritimes' },
])

const departements = ref([
  { nom: 'Paris', code: '75', region: 'Île-de-France' },
  { nom: 'Rhône', code: '69', region: 'Auvergne-Rhône-Alpes' },
  { nom: 'Bouches-du-Rhône', code: '13', region: "Provence-Alpes-Côte d'Azur" },
  { nom: 'Haute-Garonne', code: '31', region: 'Occitanie' },
  { nom: 'Alpes-Maritimes', code: '06', region: "Provence-Alpes-Côte d'Azur" },
])

const searchCommune = ref('')
const searchDepartement = ref('')
const pointX = ref('')
const pointY = ref('')
const selectedProjection = ref('EPSG:3857')

const communeResults = ref([])
const departementResults = ref([])

const projections = [
  { id: 'EPSG:3857', name: 'Web Mercator' },
  { id: 'EPSG:4326', name: 'WGS 84' },
  { id: 'EPSG:2154', name: 'Lambert 93' },
]

function toggleTab(tabId) {
  if (activeTab.value === tabId) {
    activeTab.value = null
    isSidebarOpen.value = false
  } else {
    activeTab.value = tabId
    isSidebarOpen.value = true
  }
}

function selectSubCategory(subId) {
  activeSubCategory.value = subId
}

function hideTooltip(tab) {
  tab.showTooltip = false
}

function searchCommunes() {
  const query = searchCommune.value.toLowerCase()
  communeResults.value = communes.value.filter(
    (commune) => commune.nom.toLowerCase().includes(query) || commune.code.includes(query),
  )
}

function searchDepartements() {
  const query = searchDepartement.value.toLowerCase()
  departementResults.value = departements.value.filter(
    (dept) => dept.nom.toLowerCase().includes(query) || dept.code.includes(query),
  )
}

function goToPoint() {
  console.log(`x:${pointX.value}, x: ${pointY.value} en ${selectedProjection.value}`)
}

function goToCommune(commune) {
  console.log(`com: ${commune.nom}`)
}

function goToDepartement(departement) {
  console.log(`dep: ${departement.nom}`)
}

function closeSubCategory() {
  activeSubCategory.value = null
}
</script>

<style scoped>
.sidebar-container {
  position: absolute;
  top: 8px;
  left: 0;
  height: calc(100% - 8px);
  z-index: 1000;
  display: flex;
}

.sidebar-tabs {
  width: 50px;
  height: 100%;
  background-color: #f5f5f5;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #ddd;
}

.tab-button {
  width: 100%;
  height: 50px;
  display: flex;
  justify-content: center;
  align-items: center;
  border: none;
  border-bottom: 1px solid rgb(206, 206, 206);
  background: none;
  cursor: pointer;
  font-size: 20px;
  color: #555;
  transition: background-color 0.3s;
}

.tab-button:hover {
  background-color: #e0e0e0;
}

.tab-button.active {
  background-color: #739614;
  color: #ffffff;
}

.sidebar-content {
  width: 0;
  height: 100%;
  background-color: white;
  transition: width 0.3s;
  overflow: hidden;
  border-right: 1px solid #ddd;
}

.sidebar-content.open {
  width: 400px;
}

.icon-large {
  font-size: 27px;
}

.tab-content {
  padding: 15px;
  width: 400px;
}

.tab-content h3 {
  background-color: #739614;
  color: white;
  padding: 10.7px;
  margin: -15px -15px 15px -15px;
  font-size: 18px;
  font-weight: normal;
  display: flex;
  align-items: center;
  position: relative;
}

.tab-content h3::after {
  content: 'x';
  position: absolute;
  right: 15px;
  font-weight: bold;
  cursor: pointer;
}

.tooltip {
  position: absolute;
  left: 55px;
  background-color: #739614;
  color: white;
  padding: 14px 10px;
  border-radius: 4px;
  font-size: 14px;
  white-space: nowrap;
  opacity: 0;
  transition: opacity 0.1s;
  pointer-events: none;
  z-index: 99999;
}

.tab-button:hover .tooltip {
  opacity: 1;
}

.tab-button.active .tooltip {
  opacity: 0;
}

.sub-categories {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-top: 20px;
}

.sub-category {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  padding: 15px;
  border-radius: 5px;
  transition:
    background-color 0.3s,
    transform 0.3s;
}

.sub-category:hover {
  background-color: #f0f0f0;
  transform: scale(1.05);
}

.sub-category i {
  font-size: 24px;
  color: #739614;
  transition:
    color 0.3s,
    font-size 0.3s;
}

.sub-category:hover i {
  color: #4caf50;
  font-size: 28px;
}

.sub-category span {
  font-size: 15px;
  color: #333;
  transition: color 0.3s;
}

.sub-category:hover span {
  color: #4caf50;
}

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

.sub-category-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
}

.sub-category-header h4 {
  font-size: 18px;
  color: #739614;
  margin: 0;
}

.back-button {
  background: none;
  border: none;
  color: #739614;
  cursor: pointer;
  font-size: 18px;
  transition: transform 0.2s;
}

.back-button:hover {
  transform: scale(1.1);
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

.form-group input,
.form-group select {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.input-group {
  display: flex;
}

.input-group input {
  flex: 1;
  border-right: none;
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
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

.action-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 12px;
  background-color: #739614;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  margin-top: 10px;
  transition: background-color 0.3s;
}

.action-button:hover {
  background-color: #5e7a10;
}
</style>
