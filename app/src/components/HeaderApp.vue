<template>
  <header class="header">
    <div class="logo">
      <SvgIcon :path="mdiMap" type="mdi" class="mdicon"/>
      <span>Géothèque</span>
    </div>

    <nav class="header-nav">
      <button class="header-button" title="Paramètres">
        <SvgIcon :path="mdiCog" type="mdi" class="mdicon"/>
      </button>
    </nav>
  </header>
</template>

<script setup>
import { mdiMap, mdiCog } from '@mdi/js'

</script>

<style scoped>
.header {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #739614;
  color: white;
  padding: 10px 20px;
  height: 60px;
  z-index: 99999;
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 24px;
  font-weight: bold;
}

.header-nav {
  display: flex;
  gap: 15px;
}

.header-button {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  font-size: 20px;
  transition: transform 0.2s;
}

.header-button:hover {
  transform: scale(1.1);
}

.header-button:active {
  transform: scale(0.95);
}
</style>
