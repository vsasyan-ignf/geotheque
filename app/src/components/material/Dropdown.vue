<template>
    <div class="form-group">
      <label for="projection">Système de projection</label>
      <select id="projection" v-model="selectedProjection">
        <option v-for="proj in projections" :key="proj.id" :value="proj.id">
          {{ proj.name }} ({{ proj.id }})
        </option>
      </select>
    </div>
</template>

<script setup>
const selectedProjection = ref('EPSG:3857')
  
const projections = [
  { id: 'EPSG:3857', name: 'Web Mercator' },
  { id: 'EPSG:4326', name: 'WGS 84' },
  { id: 'EPSG:2154', name: 'Lambert 93' },
]
</script>

<style scoped>
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
</style>