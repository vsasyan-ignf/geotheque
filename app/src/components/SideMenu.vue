<!-- gestion globale de la side barre -->

<template>
  <div class="sidebar-container">
    <SidebarTabs :tabs="tabs" :activeTab="activeTab" @toggle-tab="toggleTab" />

    <div class="sidebar-content" :class="{ open: isSidebarOpen }">
      <component
        :is="getActiveComponent()"
        v-if="activeTab"
        :title="activeTabTitle"
        @close="closeTab"
      >
        <template v-if="activeTab === 'carthotheque'">
          <CartothequeFrance
            :activeSubCategory="activeSubCategory"
            :subCategories="subCategories"
            @select-sub-category="selectSubCategory"
            @close-sub-category="closeSubCategory"
          />
        </template>

        <template v-else-if="activeTab === 'aide'">
          <Aide />
        </template>
      </component>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import SidebarTabs from './SidebarTabs.vue'
import TabContent from './TabContent.vue'
import CartothequeFrance from './CartothequeFrance.vue'
import Aide from './Aide.vue'

const activeTab = ref('carthotheque')
const isSidebarOpen = ref(true)
const activeSubCategory = ref(null)

const tabs = [
  { id: 'carthotheque', icon: 'layers', title: 'Cartothèque France' },
  { id: 'carthotheque_etranger', icon: 'layers', title: 'Cartothèque Étranger' },
  { id: 'phototheque', icon: 'camera', title: 'Photothèque France' },
  { id: 'phototheque_etranger', icon: 'camera', title: 'Photothèque Étranger' },
  { id: 'aide', icon: 'lightbulb-on', title: 'Aide' },
]

const subCategories = [
  { id: 'commune', icon: 'city', title: 'Commune' },
  { id: 'departement', icon: 'map', title: 'Département' },
  { id: 'point', icon: 'crosshairs-gps', title: 'Point XY' },
]

const activeTabTitle = computed(() => {
  return tabs.find((tab) => tab.id === activeTab.value)?.title || ''
})

function getActiveComponent() {
  return TabContent
}

function toggleTab(tabId) {
  if (activeTab.value === tabId) {
    activeTab.value = null
    isSidebarOpen.value = false
  } else {
    activeTab.value = tabId
    isSidebarOpen.value = true
  }
}

function closeTab() {
  activeTab.value = null
  isSidebarOpen.value = false
}

function selectSubCategory(subId) {
  activeSubCategory.value = subId
}

function closeSubCategory() {
  activeSubCategory.value = null
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

</style>
