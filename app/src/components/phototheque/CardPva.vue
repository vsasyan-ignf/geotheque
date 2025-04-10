<template>
  <div class="card-pva-container" :class="{ visible: true }">
    <button class="close-button" @click="$emit('close')">×</button>

    <div class="card-header">
      <h2>Informations PVA</h2>
    </div>

    <div class="card-content">
      <div class="preview-details">
        <div v-if="!hasPhotoInfo" class="no-data">
          <p>Aucune information disponible pour cette zone.</p>
        </div>

        <template v-else>
          <div
            v-for="(val, key, index) in photoInfo"
            :key="key"
            class="detail-item"
            :style="{ 'animation-delay': `${index * 0.05}s` }"
          >
            <div class="detail-label">{{ formatLabel(key) }}</div>
            <div class="detail-value">{{ val }}</div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  photoInfo: {
    type: Object,
    default: () => ({}),
  },
})

const hasPhotoInfo = computed(() => {
  return Object.keys(props.photoInfo).length > 0
})

function formatLabel(key) {
  return key
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}
</script>

<style scoped>
.card-pva-container {
  position: absolute;
  left: 55px; /* Positionné à gauche de la sidebar */
  top: 8px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  width: 350px;
  max-height: calc(100vh - 16px);
  overflow-y: auto;
  padding: 20px;
  z-index: 999;
  transform: translateX(0);
  transition: transform 0.3s ease-out;
  color: black;
}

.card-pva-container.visible {
  transform: translateX(400px); /* Se décale pour être visible à gauche de la sidebar */
}

.close-button {
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.2s;
}

.close-button:hover {
  background-color: rgba(0, 0, 0, 0.1);
}

.card-header {
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.card-header h2 {
  font-size: 14px;
  font-weight: 500;
  margin: 0;
}

.preview-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  padding: 2px 0;
  font-size: 12px;
  border-bottom: 1px solid #f0f0f0;
  animation: fade-in 0.5s ease forwards;
  opacity: 0;
}

.detail-label {
  font-weight: bold;
  color: #555;
  flex-basis: 40%;
}

.detail-value {
  flex-basis: 60%;
  word-break: break-word;
}

.no-data {
  text-align: center;
  padding: 20px;
  color: #666;
}

@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>
