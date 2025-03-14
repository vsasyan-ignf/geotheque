<template>
  <div class="sidebar-container">
    <div class="sidebar-tabs">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        :class="['tab-button', { active: activeTab === tab.id }]"
        @click="toggleTab(tab.id)"
        @mousedown="hideTooltip(tab)"
        @mouseenter="tab.showTooltip = true"
        @mouseleave="tab.showTooltip = false"
        :title="tab.title"
      >
        <i :class="'mdi mdi-' + tab.icon + ' icon-large'"></i>
        <div class="tooltip" v-show="activeTab !== tab.id">{{ tab.title }}</div>
      </button>
    </div>

    <div class="sidebar-content" :class="{ open: isSidebarOpen }">
      <div v-if="activeTab === 'carthotheque'" class="tab-content">
        <h3>{{ tabs.find((tab) => tab.id === activeTab)?.title }}</h3>
        <form>
          <div class="form-example">
            <h1>critere de selec</h1>

            <label for="name">adresse </label>
            <input type="text" name="name" id="name" />
            <br />

            <label for="name">min </label>
            <input type="text" name="min" id="min" />
            <br />

            <label for="name">max </label>
            <input type="text" name="max" id="max" />
            <br />

            <label for="name">echelle </label>
            <select name="pets" id="pet-select">
              <option value="">--option--</option>
              <option value="dog">Dog</option>
              <option value="cat">Cat</option>
              <option value="hamster">Hamster</option>
              <option value="parrot">Parrot</option>
              <option value="spider">Spider</option>
              <option value="goldfish">Goldfish</option>
            </select>
            <br />

            <label for="name">collection </label>
            <select name="pets" id="pet-select">
              <option value="">--option--</option>
              <option value="dog">Dog</option>
              <option value="cat">Cat</option>
              <option value="hamster">Hamster</option>
              <option value="parrot">Parrot</option>
              <option value="spider">Spider</option>
              <option value="goldfish">Goldfish</option>
              <br />
            </select>
            <br />
            <button type="submit">valider</button>
            <br />
            <h1>afficher les scans</h1>
            <label for="name">scan </label>
            <select name="pets" id="pet-select">
              <option value="">--option--</option>
              <option value="dog">Dog</option>
              <option value="cat">Cat</option>
              <option value="hamster">Hamster</option>
              <option value="parrot">Parrot</option>
              <option value="spider">Spider</option>
              <option value="goldfish">Goldfish</option>
              <br />
            </select>

            <br />
            <button type="submit">valider</button>
          </div>
        </form>
        <div class="sub-categories">
          <div v-for="sub in subCategories" :key="sub.id" class="sub-category">
            <i :class="'mdi mdi-' + sub.icon"></i>
            <span>{{ sub.title }}</span>
          </div>
        </div>
      </div>
      <div v-if="activeTab === 'carthotheque_etranger'" class="tab-content">
        <h3>{{ tabs.find((tab) => tab.id === activeTab)?.title }}</h3>
      </div>
      <div v-if="activeTab === 'phototheque'" class="tab-content">
        <h3>{{ tabs.find((tab) => tab.id === activeTab)?.title }}</h3>
      </div>
      <div v-if="activeTab === 'phototheque_etranger'" class="tab-content">
        <h3>{{ tabs.find((tab) => tab.id === activeTab)?.title }}</h3>
      </div>
      <div v-if="activeTab === 'aide'" class="tab-content">
        <h3>{{ tabs.find((tab) => tab.id === activeTab)?.title }}</h3>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const activeTab = ref('carthotheque')
const isSidebarOpen = ref(true)

const tabs = [
  { id: 'carthotheque', icon: 'layers', title: 'Cartothèque France' },
  { id: 'carthotheque_etranger', icon: 'file', title: 'Cartothèque Étranger' },
  { id: 'phototheque', icon: 'database', title: 'Photothèque France' },
  { id: 'phototheque_etranger', icon: 'database', title: 'Photothèque Étranger' },
  { id: 'aide', icon: 'database', title: 'Aide' },
]

const subCategories = [
  { id: 'commune', icon: 'city', title: 'Commune' },
  { id: 'departement', icon: 'map', title: 'Département' },
  { id: 'point', icon: 'crosshairs-gps', title: 'Point coordonnée' },
]

function toggleTab(tabId) {
  if (activeTab.value === tabId) {
    activeTab.value = null
    isSidebarOpen.value = false
  } else {
    activeTab.value = tabId
    isSidebarOpen.value = true
  }
}

function hideTooltip(tab) {
  tab.showTooltip = false
}
</script>

<style scoped>
.sidebar-container {
  position: absolute;
  top: 8px;
  left: 0;
  height: calc(100% - 8px);
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
  border-bottom: 1px solid rgb(206, 206, 206);
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
  background-color: #739614;
  color: #ffffff;
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
  width: 400px;
}

.icon-large {
  font-size: 27px;
}

.tab-content {
  padding: 15px;
  width: 400px;
}

.tab-content h3 {
  background-color: #739614;
  color: white;
  padding: 11px;
  margin: -15px -15px 15px -15px;
  font-size: 18;
  font-weight: normal;
  display: flex;
  align-items: center;
  position: relative;
}

.tab-content h3::after {
  content: 'x';
  position: absolute;
  right: 15px;
  font-weight: bold;
  cursor: pointer;
}

.tooltip {
  position: absolute;
  left: 55px;
  background-color: #739614;
  color: white;
  padding: 14px 10px;
  border-radius: 4px;
  font-size: 14px;
  white-space: nowrap;
  opacity: 0;
  transition: opacity 0.1s;
  pointer-events: none;
  z-index: 99999;
}

.tab-button:hover .tooltip {
  opacity: 1;
}

.tab-button.active .tooltip {
  opacity: 0;
}

.sub-categories {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 20px;
}

.sub-category {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 10px;
  cursor: pointer;
  width: 100%;
}

.sub-category i {
  font-size: 24px;
  color: #739614;
  width: 100%;
  text-align: center;
}

.sub-category span {
  font-size: 18px;
  color: #333;
  width: 100%;
  text-align: center;
}
</style>
