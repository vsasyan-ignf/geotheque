<template>
  <div class="accordeon">
    <div class="accordeon-header" @click="toggleAccordeon(0)">
      <h4 class="accordeon-title">Critères de sélection</h4>
      <i class="mdi" :class="isOpen[0] ? 'mdi-chevron-up' : 'mdi-chevron-down'"></i>
    </div>
    <div class="accordeon-content" :class="{ open: isOpen[0] }">
      <CritereSelection />
    </div>
    <div class="accordeon-header" @click="toggleAccordeon(1)">
      <h4 class="accordeon-title">Afficher les scans</h4>
      <i class="mdi" :class="isOpen[1] ? 'mdi-chevron-up' : 'mdi-chevron-down'"></i>
    </div>
    <div class="accordeon-content" :class="{ open: isOpen[1] }">
      <AfficherScans />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import CritereSelection from './CritereSelection.vue'
import AfficherScans from './AfficherScans.vue'

const isOpen = ref([false, false])

function toggleAccordeon(ind) {
  isOpen.value[ind] = !isOpen.value[ind]
}
</script>

<style scoped>
.accordeon {
  width: 100%;
  margin-top: 30px;
}

.accordeon-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  border-top: 1px solid #eee;
  padding-top: 10px;
}

.accordeon-header:hover .accordeon-title {
  color: #739614;
}

.accordeon-header i {
  color: #739614;
  font-size: 20px;
  transition: transform 0.3s ease;
}

.accordeon-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0;
  transition: color 0.3s ease;
}

.accordeon-content {
  max-height: 0;
  overflow: hidden;
  transition:
    max-height 0.3s ease,
    opacity 0.3s ease;
  opacity: 0;
  margin-bottom: 30px;
}

.accordeon-content.open {
  max-height: 800px;
  overflow: visible;
  opacity: 1;
}
</style>
