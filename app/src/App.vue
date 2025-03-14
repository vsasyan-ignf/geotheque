<script setup>
import { ref, onMounted, nextTick } from "vue";

const center = ref([260000, 6000000]);
const projection = ref("EPSG:3857");
const zoom = ref(6);
const rotation = ref(0);

const activeTab = ref('carthotheque');
const isSidebarOpen = ref(true);

const tabs = [
  { id: 'carthotheque', icon: 'layers', title: 'Cartothèque France' },
  { id: 'carthotheque_etranger', icon: 'file', title: 'Cartothèque Étranger' },
  { id: 'phototheque', icon: 'database', title: 'Photothèque France' },
  { id: 'phototheque_etranger', icon: 'database', title: 'Photothèque Étranger' },
  { id: 'aide', icon: 'database', title: 'Aide' },
];

function toggleTab(tabId) {
  if (activeTab.value === tabId) {
    activeTab.value = null;
    isSidebarOpen.value = false;
  } else {
    activeTab.value = tabId;
    isSidebarOpen.value = true;
  }
}

onMounted(() => {
  // refresh pour le changement de state
  nextTick(() => {
    window.dispatchEvent(new Event("resize"));
  });
});
</script>

<template>
  <div class="map-container">
    <div class="sidebar-container">
      <div class="sidebar-tabs">
        <button 
          v-for="tab in tabs" 
          :key="tab.id"
          :class="['tab-button', { active: activeTab === tab.id }]"
          @click="toggleTab(tab.id)"
          :title="tab.title"
        >
          <i :class="'mdi mdi-' + tab.icon"></i>
          <div class="tooltip" v-show="!isSidebarOpen">{{ tab.title }}</div>

        </button>
      </div>
      
      <div class="sidebar-content" :class="{ open: isSidebarOpen }">
        <div v-if="activeTab === 'carthotheque'" class="tab-content">
          <h3>{{ tabs.find(tab => tab.id === activeTab)?.title }}</h3>
          <!-- exemple <p>Layer management content goes here</p> -->
        </div>
        <div v-if="activeTab === 'carthotheque_etranger'" class="tab-content">
          <h3>{{ tabs.find(tab => tab.id === activeTab)?.title }}</h3>
        </div>
        <div v-if="activeTab === 'phototheque'" class="tab-content">
          <h3>{{ tabs.find(tab => tab.id === activeTab)?.title }}</h3>
        </div>
        <div v-if="activeTab === 'phototheque_etranger'" class="tab-content">
          <h3>{{ tabs.find(tab => tab.id === activeTab)?.title }}</h3>
        </div>
        <div v-if="activeTab === 'aide'" class="tab-content">
          <h3>{{ tabs.find(tab => tab.id === activeTab)?.title }}</h3>
        </div>
      </div>
    </div>

    <ol-map class="ol-map">
      <ol-view
        ref="view"
        :center="center"
        :rotation="rotation"
        :zoom="zoom"
        :projection="projection"
      />

      <ol-tile-layer>
        <ol-source-osm />
      </ol-tile-layer>
    </ol-map>
  </div>
</template>

<style scoped>
.map-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
}

.ol-map {
  width: 100%;
  height: 100%;
}

.sidebar-container {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
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
  background-color: #ddd;
  color: #2196F3;
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
  width: 300px;
}

.tab-content {
  padding: 15px;
}

.tab-content h3 {
  background-color: #911515;
  color: white;
  padding: 12px;
  margin: -15px -15px 15px -15px;
  font-size: 16px;
  font-weight: normal;
  display: flex;
  align-items: center;
  position: relative;
}

.tab-content h3::after {
  content: "x";
  position: absolute;
  right: 15px;
  font-weight: bold;
  cursor: pointer;
}

.tooltip {
  position: absolute;
  left: 50px;
  background-color: #333;
  color: white;
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 14px;
  white-space: nowrap;
  opacity: 0;
  transition: opacity 0.3s;
  pointer-events: none;
}

.tooltip::before {
  content: "";
  position: absolute;
  top: 50%;
  left: -5px;
  margin-top: -5px;
  border-width: 5px 5px 5px 0;
  border-style: solid;
  border-color: transparent #333 transparent transparent;
}

.tab-button:hover .tooltip {
  opacity: 1;
}

/* .icon-layers:before { content: "\25A2"; }
.icon-file:before { content: "\1F4C4"; }
.icon-map-pin:before { content: "\1F4CD"; }
.icon-tool:before { content: "\1F527"; }
.icon-settings:before { content: "\2699"; }
.icon-info:before { content: "\2139"; } */

</style>