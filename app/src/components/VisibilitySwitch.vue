<template>
  <div class="map-visibility-container">
    <button
      @click="toggleMapVisibility"
      class="visibility-toggle-button"
      :class="{ 'map-hidden': !isMapVisible }"
    >
      <span
        class="tooltip"
        v-text="isMapVisible ? 'Masquer le fond de carte' : 'Afficher le fond de carte'"
      ></span>
      <svg
        v-if="isMapVisible"
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
        <circle cx="12" cy="12" r="3"></circle>
      </svg>
      <svg
        v-else
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path
          d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"
        ></path>
        <line x1="1" y1="1" x2="23" y2="23"></line>
      </svg>
    </button>
  </div>
</template>

<script setup>
import { ref, inject, watch } from 'vue'

const isMapVisible = ref(true)
const eventBus = inject('eventBus')
const emit = defineEmits(['toggle-visibility'])

function toggleMapVisibility() {
  isMapVisible.value = !isMapVisible.value
  emit('toggle-visibility', isMapVisible.value)
  eventBus.emit('toggle-map-visibility', isMapVisible.value)
}

watch(isMapVisible, (newValue) => {
  emit('toggle-visibility', newValue)
})
</script>

<style scoped>
.map-visibility-container {
  position: absolute;
  top: 120px;
  right: 20px;
  z-index: 10;
}

.visibility-toggle-button {
  width: 40px;
  height: 40px;
  background-color: white;
  border: none;
  border-radius: 4px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  color: #333;
}

.visibility-toggle-button:hover {
  background-color: #f5f5f5;
}

.visibility-toggle-button.map-hidden {
  background-color: #e0e0e0;
  color: #666;
}

svg {
  transition: opacity 0.2s ease;
}

.tooltip {
  visibility: hidden;
  background-color: #739614;
  color: #fff;
  text-align: center;
  border-radius: 4px;
  padding: 16px 15px;
  position: absolute;
  z-index: 20;
  bottom: 0px;
  left: -5px;
  transform: translateX(-100%);
  white-space: nowrap;
  opacity: 0;
  transition: opacity 0.2s;
}

.visibility-toggle-button:hover .tooltip {
  visibility: visible;
  opacity: 1;
}
</style>
