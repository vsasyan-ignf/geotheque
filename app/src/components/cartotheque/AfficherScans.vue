<template>
  <div class="scan-box">
    <form class="criteria-form" @submit.prevent="">
      <SparkleButton nameButton="Exporter les scans" @click="downloadCSV">
        <template #icon
          ><SvgIcon type="mdi" :path="mdiBriefcaseDownload" class="mdicon"
        /></template>
      </SparkleButton>
      <div class="dropdown-container">
        <div class="dropdown-wrapper">
          <Dropdown
            nameDropdown="Nom du Scan"
            :options="storeScansData"
            :disableOption="textDisableOption"
          />
        </div>
      </div>
      <div class="button-group">
        <ShakingButton nameButton="Visualiser" @click="openIipmooviewer">
          <template #icon><SvgIcon type="mdi" :path="mdiMonitorEye" class="mdicon" /></template>
        </ShakingButton>
        <ShakingButton nameButton="Télécharger" @click="downloadScans">
          <template #icon
            ><SvgIcon type="mdi" :path="mdiBriefcaseDownload" class="mdicon"
          /></template>
        </ShakingButton>
        <ShakingButton nameButton="XML" @click="downloadxml">
          <template #icon><SvgIcon type="mdi" :path="mdiXml" class="mdicon" /></template>
        </ShakingButton>
      </div>
    </form>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import ShakingButton from '@/components/material/ShakingButton.vue'
import SparkleButton from '../material/SparkleButton.vue'
import Dropdown from '@/components/material/Dropdown.vue'
import { useScanStore } from '@/components/store/scan'
import { storeToRefs } from 'pinia'
import { mdiMonitorEye, mdiBriefcaseDownload, mdiXml } from '@mdi/js'

const scanStore = useScanStore()
const { storeScansData, currentCollecInfo } = storeToRefs(scanStore)

const imageUrl = ref('')
const textDisableOption = computed(() => {
  return storeScansData.value === null || storeScansData.value.length === 0
    ? 'Pas de scans résultats'
    : 'Veuillez sélectionner un scan'
})

function generateImageUrl(info) {
  const lieu = 'METROPOLE'
  let name = ''
  let url = ''

  if (info[1] !== '') {
    url = `http://localhost:8080/fcgi-bin/iipsrv.fcgi?FIF=Cartes/${lieu}/${info[0]}/${info[1]}/${info[2]}.JP2&CVT=jpeg`
    name = info[2]
  } else {
    url = `http://localhost:8080/fcgi-bin/iipsrv.fcgi?FIF=Cartes/${lieu}/${info[0]}/${info[2]}.JP2&CVT=jpeg`
    name = info[1]
  }

  return { url, name }
}

watch(currentCollecInfo, (newVal) => {
  if (newVal) {
    const info = currentCollecInfo.value.split('/')
    const { url, name } = generateImageUrl(info)
    imageUrl.value = url
  }
})

function openIipmooviewer() {
  if (imageUrl.value) {
    const urlParams = new URLSearchParams(new URL(imageUrl.value).search)
    const imageUrlServ = urlParams.get('FIF')
    sessionStorage.setItem('imageUrl', imageUrlServ)
    window.open('/geotheque/iipmooviewer/index.html', '_blank')
  } else {
    console.error("L'URL de l'image est indéfinie.")
  }
}

function downloadScans() {
  if (currentCollecInfo.value) {
    const info = currentCollecInfo.value.split('/')
    const { url, name } = generateImageUrl(info)

    fetch(url)
      .then((response) => response.blob())
      .then((blob) => {
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', name)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
      })
      .catch((error) => console.error('Erreur lors du téléchargement:', error))
  }
}

let url_xml = ref(``)

function downloadxml() {
  if (currentCollecInfo.value) {
    const info = currentCollecInfo.value.split('/')
    const lieu = 'METROPOLE'
    if (info.length == 3) {
      url_xml = `http://localhost:8082/Cartes/${lieu}/${info[0]}/${info[1]}/Fiches/${info[2]}.xml`
    } else {
      url_xml = `http://localhost:8082/Cartes/${lieu}/${info[0]}/Fiches/${info[1]}.xml`
    }
    console.log('url_xml:', url_xml)
    window.open(url_xml, 'xml')
  }
}

function downloadCSV() {
  const data = storeScansData.value

  if (data) {
    const newData = data.map((scan) => scan.properties)
    const csvContent = dicoToFormatCSV(newData)
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8,' })
    const objUrl = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', objUrl)
    link.setAttribute('download', 'scans.csv')
    link.click()
  }
}

function dicoToFormatCSV(arrObj) {
  const titleKeys = Object.keys(arrObj[0])

  const refinedData = []
  refinedData.push(titleKeys)

  arrObj.forEach((item) => {
    refinedData.push(Object.values(item))
  })

  let csvContent = ''

  refinedData.forEach((row) => {
    csvContent += row.join(';') + '\n'
  })
  return csvContent
}
</script>
<style scoped>
.scan-box {
  padding-top: 10px;
  width: 100%;
  box-sizing: border-box;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 15px;
}

.criteria-form {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  width: 100%;
}

.dropdown-container {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 10px;
  margin-bottom: 10px;
  width: 100%;
  gap: 8px;
}

.dropdown-wrapper {
  flex: 1;
  width: 100%;
}

.form-row {
  display: flex;
  gap: 10px;
  width: 100%;
  flex-wrap: wrap;
}
.form-group {
  width: 100%;
}
.form-group.half {
  flex: 1;
  min-width: calc(50% - 5px);
  max-width: calc(50% - 5px);
}
.form-group label {
  font-size: 14px;
  color: #555;
}
.form-group input {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  transition:
    border-color 0.3s,
    box-shadow 0.3s;
  width: 100%;
  box-sizing: border-box;
}

.form-group input:focus {
  border-color: #739614;
  outline: none;
  box-shadow: 0 0 0 2px rgba(115, 150, 20, 0.2);
}

.button-group {
  margin-top: 10px;
  display: flex;
  gap: 10px;
}
.search-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 15px;
  background-color: #739614;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition:
    background-color 0.3s,
    transform 0.2s;
}
.search-button:hover {
  background-color: #5e7a10;
}

.search-button:active {
  transform: translateY(1px);
}

@media (max-width: 500px) {
  .form-row {
    flex-direction: column;
    gap: 15px;
  }

  .form-group.half {
    min-width: 100%;
    max-width: 100%;
  }
}
</style>
