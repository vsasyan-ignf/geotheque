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
            @click="$emit('select-departement', dept)"
          >
            <div class="result-main">{{ dept.nom }}</div>
            <div class="result-secondary">{{ dept.code }} - {{ dept.region }}</div>
          </div>
        </div>
      </div>
  
      <div class="no-results" v-else-if="searchDepartement">Aucun département trouvé</div>
    </div>

    <CartothequeSubMenu/>
  </div>
</template>
  
<script setup>
import { ref } from 'vue'
import SubCategoryHeader from './SubCategoryHeader.vue'
import CartothequeSubMenu from './CartothequeSubMenu.vue'
  
defineEmits(['close', 'select-departement'])
  
const searchDepartement = ref('')
const departementResults = ref([])
  
const departements = [
  { nom: 'Paris', code: '75', region: 'Île-de-France' },
  { nom: 'Rhône', code: '69', region: 'Auvergne-Rhône-Alpes' },
  { nom: 'Bouches-du-Rhône', code: '13', region: "Provence-Alpes-Côte d'Azur" },
  { nom: 'Haute-Garonne', code: '31', region: 'Occitanie' },
  { nom: 'Alpes-Maritimes', code: '06', region: "Provence-Alpes-Côte d'Azur" },
]
  
function searchDepartements() {
  const query = searchDepartement.value.toLowerCase()
  departementResults.value = departements.filter(
    (dept) => dept.nom.toLowerCase().includes(query) || dept.code.includes(query)
  )
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