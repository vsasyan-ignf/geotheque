<template>
  <div class="critere-selection" @submit.prevent="handleSubmit">
    <form class="criteria-form" action="">
      <div class="form-row">
        <div class="form-group half">
          <label for="yearMin">Année min.</label>
          <input id="yearMin" type="text" v-model="yearMin" autocomplete="off" />
        </div>
        <div class="form-group half">
          <label for="yearMax">Année max.</label>
          <input id="yearMax" type="text" v-model="yearMax" autocomplete="off" />
        </div>
      </div>

      <div class="form-row">
        <div class="form-group half">
          <label for="scaleMin">Echelle min.</label>
          <input id="scaleMin" type="text" v-model="scaleMin" autocomplete="off" />
        </div>
        <div class="form-group half">
          <label for="scaleMax">Echelle max.</label>
          <input id="scaleMax" type="text" v-model="scaleMax" autocomplete="off" />
        </div>
      </div>

      <Dropdown nameDropdown="Collections" />

      <div class="button-group">
        <button type="submit" class="search-button">
          <i class="mdi mdi-magnify"></i>
          <span>Rechercher</span>
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Dropdown from './material/Dropdown.vue'
import { bboxState, eventBus } from './composable/eventBus'

const yearMin = ref('2000')
const yearMax = ref('2000')
const scaleMin = ref('2000')
const scaleMax = ref('2000')

const handleSubmit = () => {
  const criteria = {
    yearMin: yearMin.value,
    yearMax: yearMax.value,
    scaleMin: scaleMin.value,
    scaleMax: scaleMax.value,
    bboxe:bboxState.value,
    loadWfs: true
  }

  eventBus.emit('criteria', criteria);
}
</script>

<style scoped>
.critere-selection {
  padding-top: 10px;
  width: 100%;
  box-sizing: border-box;
}

.criteria-form {
  display: flex;
  flex-direction: column;
  gap: 5px;
  width: 100%;
}

.form-row {
  display: flex;
  gap: 10px;
  width: 100%;
  flex-wrap: wrap;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
  width: 100%;
  box-sizing: border-box;
}

.form-group.half {
  flex: 1;
  min-width: calc(50% - 5px);
  max-width: calc(50% - 5px);
}

.form-group label {
  font-size: 14px;
  color: #555;
}

.form-group input {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  transition:
    border-color 0.3s,
    box-shadow 0.3s;
  width: 100%;
  box-sizing: border-box;
}

.form-group input:focus {
  border-color: #739614;
  outline: none;
  box-shadow: 0 0 0 2px rgba(115, 150, 20, 0.2);
}

.button-group {
  margin-top: 10px;
}

.search-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 15px;
  background-color: #739614;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition:
    background-color 0.3s,
    transform 0.2s;
}

.search-button:hover {
  background-color: #5e7a10;
}

.search-button:active {
  transform: translateY(1px);
}

@media (max-width: 500px) {
  .form-row {
    flex-direction: column;
    gap: 15px;
  }

  .form-group.half {
    min-width: 100%;
    max-width: 100%;
  }
}
</style>
