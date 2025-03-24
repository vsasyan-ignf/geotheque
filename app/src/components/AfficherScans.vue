<template>
  <div class="scan-box">
    <form class="criteria-form" @submit.prevent="">
      <Dropdown :options="storeData"/>

      <div class="button-group">
        <ShakingButton nameButton="Visualiser" @click="openModal">
          <template #icon><i class="mdi mdi-eye"></i></template>
        </ShakingButton>
        <ShakingButton nameButton="Télécharger" @click="downloadScans">
          <template #icon><i class="mdi mdi-briefcase-download"></i></template>
        </ShakingButton>
        <ShakingButton nameButton="XML" @click="downloadxml"/>
      </div>
    </form>

    <ImageModal 
      :is-open="isModalOpen" 
      :image-url="imageUrl"
      title="Visualisation de l'image : 21FD0120x00001_03343.jp2"
      @close="closeModal"
    />

  </div>
</template>

<script setup>
import { ref, watch} from 'vue'
import ShakingButton from './material/ShakingButton.vue'
import Dropdown from './material/Dropdown.vue'
import ImageModal from './ImageModal.vue'
import { useScanStore } from './store/scan'
import { storeToRefs } from 'pinia'

const scanStore = useScanStore()
const { storeData, currentCollecInfo } = storeToRefs(scanStore);

const isModalOpen = ref(false)
const imageUrl = ref('http://localhost:8080/fcgi-bin/iipsrv.fcgi?FIF=Cartes/METROPOLE/CASSINI/CARTES/001_86K_1756.JP2&CVT=jpeg')


const url_xml = ' http://localhost:8081/Misphot/Lambert93/2021/2021_FD 01_C_20/'+
  '2021_FD 01_C_20.xml'


function downloadScans() {
  if (currentCollecInfo.value){
    const image_name = currentCollecInfo.value
    const lieu = "METROPOLE"
    const imageUrl = `http://localhost:8080/fcgi-bin/iipsrv.fcgi?FIF=Cartes/${lieu}/${image_name}.JP2&CVT=jpeg`;
    fetch(imageUrl)
      .then(response => response.blob())
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", image_name);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      })
      .catch(error => console.error("Erreur lors du téléchargement:", error));
    }
  
}

function downloadxml(){
  window.open(url_xml, "xml")
}

function openModal() {
  isModalOpen.value = true
}

function closeModal() {
  isModalOpen.value = false
}



</script>

<style scoped>
.scan-box {
  margin-top: 20px;
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
  gap: 5px;
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
