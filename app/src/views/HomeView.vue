<template>
  <HeaderApp />
  <MapBox />
  <Alert
    v-if="!hasApiKey"
    type="error"
    title="Clé API manquante"
    :show="true"
    :dismissible="true"
    :duration="6000"
  >
    Vous devez fournir une clé API dans l'URL pour utiliser cette application.
  </Alert>

  <Alert
    v-if="hasApiKey && !isApiKeyValid"
    type="warning"
    title="Clé API invalide"
    :show="true"
    :dismissible="true"
    :duration="6000"
  >
    Votre clé API est invalide ou a expiré.
    Veuillez vérifier votre clé ou en obtenir une nouvelle.
  </Alert>
</template>

<script setup>
import HeaderApp from '@/components/HeaderApp.vue'
import MapBox from '@/components/MapBox.vue'
import Alert from '@/components/material/Alert.vue';
import { ref, onMounted } from 'vue'
import config from '@/config';

const hasApiKey = ref(false)
const isApiKeyValid = ref(true)
const apiKey = ref('')

onMounted(async () => {
  const urlParams = new URLSearchParams(window.location.search)
  apiKey.value = urlParams.get('apikey')
  hasApiKey.value = !!apiKey.value
  
  if (hasApiKey.value) {
    await validateApiKey(apiKey.value)
  }
})

const validateApiKey = async (key) => {
  try {
    const testUrl = `${config.GEOSERVER_URL}&request=GetCapabilities&apikey=${key}`
    
    const response = await fetch(testUrl)
    if (response.status === 401) {
      isApiKeyValid.value = false
      console.error('401 Authorization Required')
    } else {
      isApiKeyValid.value = true
      console.log('api key valide')
    }
  } catch (error) {
    isApiKeyValid.value = false
  }
}
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