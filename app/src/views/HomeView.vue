<template>
  <HeaderApp />
  <MapBox />
</template>

<script setup>
import HeaderApp from '@/components/HeaderApp.vue'
import MapBox from '@/components/MapBox.vue'
</script>

<style>
.mdicon {
  height: 20px;
  width: 20px;
  color: #ffffff;
}

::-webkit-scrollbar {
  width: 2px;
  height: 2px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background-color: rgba(100, 100, 100, 0.5);
  border-radius: 10px;
}

::-webkit-scrollbar-thumb:hover {
  background-color: rgba(115, 150, 20, 0.7);
}

* {
  scrollbar-width: thin;
  scrollbar-color: rgba(115, 150, 20, 0.7) transparent;
}

html, body {
  scrollbar-width: thin;
  scrollbar-color: rgba(115, 150, 20, 0.7) transparent;
}
</style>