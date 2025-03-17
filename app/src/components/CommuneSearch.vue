<!-- recherche par commune -->

<template>
  <div class="sub-category-content">
    <SubCategoryHeader title="Recherche par commune" @close="$emit('close')" />

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
            @click="$emit('select-commune', commune)"
          >
            <div class="result-main">{{ commune.nom }}</div>
            <div class="result-secondary">{{ commune.code }} - {{ commune.departement }}</div>
          </div>
        </div>
      </div>

      <div class="no-results" v-else-if="searchCommune">Aucune commune trouvée</div>
    </div>

    <CritereSelection />
    <AfficherScans />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import SubCategoryHeader from './SubCategoryHeader.vue'
import CritereSelection from './CritereSelection.vue'
import AfficherScans from './AfficherScans.vue'

defineEmits(['close', 'select-commune'])

const searchCommune = ref('')
const communeResults = ref([])

const communes = [
  { nom: 'Paris', code: '75000', departement: 'Paris' },
  { nom: 'Lyon', code: '69000', departement: 'Rhône' },
  { nom: 'Marseille', code: '13000', departement: 'Bouches-du-Rhône' },
  { nom: 'Toulouse', code: '31000', departement: 'Haute-Garonne' },
  { nom: 'Nice', code: '06000', departement: 'Alpes-Maritimes' },
]

function searchCommunes() {
  const query = searchCommune.value.toLowerCase()
  communeResults.value = communes.filter(
    (commune) => commune.nom.toLowerCase().includes(query) || commune.code.includes(query),
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
