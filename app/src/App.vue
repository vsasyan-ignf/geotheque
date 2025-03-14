<script setup>
import { ref, onMounted, nextTick } from "vue";

const center = ref([260000, 6000000]);
const projection = ref("EPSG:3857");
const zoom = ref(6);
const rotation = ref(0);

const activeTab = ref(null);
const isSidebarOpen = ref(false);

const tabs = [
  { id: 'param1', icon: 'layers', title: 'Param1' },
  { id: 'param2', icon: 'file', title: 'Param2' },
  { id: 'param3', icon: 'database', title: 'Param3' },
  { id: 'param4', icon: 'database', title: 'Param4' },
  { id: 'param5', icon: 'database', title: 'Param5' },
  { id: 'param6', icon: 'database', title: 'Param5'}
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
        </button>
      </div>
      
      <div class="sidebar-content" :class="{ open: isSidebarOpen }">
        <div v-if="activeTab === 'param1'" class="tab-content">
          <h3>Layers</h3>
          <p>Layer management content goes here</p>
        </div>
        <div v-if="activeTab === 'param2'" class="tab-content">
          <h3>Files</h3>
          <p>File management content goes here</p>
        </div>
        <div v-if="activeTab === 'param3'" class="tab-content">
          <h3>Location</h3>
          <p>Location settings content goes here</p>
        </div>
        <div v-if="activeTab === 'param4'" class="tab-content">
          <h3>Tools</h3>
          <p>Map tools content goes here</p>
        </div>
        <div v-if="activeTab === 'param5'" class="tab-content">
          <h3>Settings</h3>
          <p>Settings content goes here</p>
        </div>
        <div v-if="activeTab === 'param6'" class="tab-content">
          <h3>Info</h3>
          <p>Map information content goes here</p>
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

.icon-layers:before { content: "\25A2"; }
.icon-file:before { content: "\1F4C4"; }
.icon-map-pin:before { content: "\1F4CD"; }
.icon-tool:before { content: "\1F527"; }
.icon-settings:before { content: "\2699"; }
.icon-info:before { content: "\2139"; }

</style>