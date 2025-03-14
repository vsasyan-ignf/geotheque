<!-- gestion de l'affichage des onglets et interactions -->


<template>
  <div class="sidebar-tabs">
    <button
      v-for="tab in tabs"
      :key="tab.id"
      :class="['tab-button', { active: activeTab === tab.id }]"
      @click="$emit('toggle-tab', tab.id)"
      @mousedown="hideTooltip(tab)"
      @mouseenter="tab.showTooltip = true"
      @mouseleave="tab.showTooltip = false"
      :title="tab.title"
    >
      <i :class="'mdi mdi-' + tab.icon + ' icon-large'"></i>
      <div class="tooltip" v-show="activeTab !== tab.id">{{ tab.title }}</div>
    </button>
  </div>
</template>
  
<script setup>
defineProps({
  tabs: {
    type: Array,
    required: true
  },
  activeTab: {
    type: String,
    default: null
  }
})
  
defineEmits(['toggle-tab'])
  
function hideTooltip(tab) {
  tab.showTooltip = false
}
</script>
  
<style scoped>
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

.icon-large {
   font-size: 27px;
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
</style>