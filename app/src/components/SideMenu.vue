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
        <template v-if="activeTab === 'cartotheque'">
          <CartothequeFrance
            :activeSubCategory="activeSubCategory"
            :subCategories="subCategories"
            @select-sub-category="selectSubCategory"
            @close-sub-category="closeSubCategory"
          />
        </template>

        <template v-if="activeTab === 'cartotheque_etranger'">
          <CartothequeEtranger
            :activeSubCategory="activeSubCategory"
            :subCategories="subCategoriesEtranger"
            @select-sub-category="selectSubCategory"
            @close-sub-category="closeSubCategory"
          />
        </template>

        <template v-if="activeTab === 'phototheque'">
          <PhotothequeFrance
            :activeSubCategory="activeSubCategory"
            :subCategories="subCategoriesPhototheque"
            @select-sub-category="selectSubCategory"
            @close-sub-category="closeSubCategory"
          />
        </template>

        <template v-else-if="activeTab === 'aide'">
          <Aide />
        </template>
      </component>
      <Panier v-if="activeTab === 'phototheque'"/>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import SidebarTabs from './SidebarTabs.vue'
import TabContent from './TabContent.vue'
import CartothequeFrance from './cartotheque/CartothequeFrance.vue'
import CartothequeEtranger from './cartotheque/CartothequeEtranger.vue'
import PhotothequeFrance from './phototheque/PhotothequeFrance.vue'
import Aide from './Aide.vue'
import { useScanStore } from './store/scan'
import Panier from './phototheque/Panier.vue'
const scanStore = useScanStore()

const activeTab = ref('cartotheque')
const isSidebarOpen = ref(true)
const activeSubCategory = ref(null)

const tabs = [
  { id: 'cartotheque', icon: 'layers', title: 'Cartothèque France' },
  { id: 'cartotheque_etranger', icon: 'layers', title: 'Cartothèque Étranger' },
  { id: 'phototheque', icon: 'camera', title: 'Photothèque France' },
  { id: 'phototheque_etranger', icon: 'camera', title: 'Photothèque Étranger' },
  { id: 'aide', icon: 'lightbulb-on', title: 'Aide' },
]

const subCategories = [
  { id: 'commune', icon: 'commune', title: 'Commune' },
  { id: 'departement', icon: 'departement', title: 'Département' },
  { id: 'point', icon: 'point', title: 'Point XY' },
]

const subCategoriesEtranger = [
  { id: 'feuilles', icon: 'feuille', title: 'Feuilles' },
  { id: 'pays', icon: 'pays', title: 'Pays' },
  { id: 'point', icon: 'point', title: 'Point XY' },
]

const subCategoriesPhototheque = [
  { id: 'commune', icon: 'commune', title: 'Commune' },
  { id: 'departement', icon: 'departement', title: 'Département' },
  { id: 'feuilles', icon: 'feuille', title: 'Feuilles' },
  { id: 'point', icon: 'point', title: 'Point XY' },
  { id: 'autre', icon: 'autre', title: 'Autre' },
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
    // scanStore.updateActiveTab(null)
  } else {
    activeTab.value = tabId
    isSidebarOpen.value = true
    scanStore.updateActiveTab(tabId)
    activeSubCategory.value = null
    scanStore.updateActiveSubCategory(null)
  }
}

function closeTab() {
  activeTab.value = null
  isSidebarOpen.value = false
}

function selectSubCategory(subId) {
  activeSubCategory.value = subId
  scanStore.updateActiveSubCategory(subId)
}

function closeSubCategory() {
  activeSubCategory.value = null
  scanStore.updateActiveSubCategory(null)
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
