<template>
    <div class="zoom-controls-container">
      <button 
        @click="zoomIn" 
        class="zoom-button zoom-in"
        title="Zoomer"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
      </button>

      <button 
        @click="zoomOut" 
        class="zoom-button zoom-out"
        title="Dézoomer"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
      </button>
    </div>
</template>

<script setup>
import { inject } from 'vue';
  
const eventBus = inject('eventBus');
function zoomIn() {
    eventBus.emit('map-zoom', 1);
}

function zoomOut() {
    eventBus.emit('map-zoom', -1);
}

</script>
  

<style scoped>

.zoom-controls-container {
    position: absolute;
    top: 20px;
    right: 20px;
    z-index: 10;
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.zoom-button {
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

.zoom-button:hover {
    background-color: #f5f5f5;
}

.zoom-button:active {
    background-color: #e0e0e0;
    transform: translateY(1px);
}

</style>