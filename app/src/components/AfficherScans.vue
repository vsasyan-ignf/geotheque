<template>
  <div class="scan-box">
    <form class="criteria-form" action="">
      <Dropdown :options="tab_scans"/>

      <div class="button-group">
        <ShakingButton nameButton="Visualiser">
          <template #icon><i class="mdi mdi-eye"></i></template>
        </ShakingButton>
        <ShakingButton nameButton="Télécharger">
          <template #icon><i class="mdi mdi-briefcase-download"></i></template>
        </ShakingButton>
        <ShakingButton nameButton="XML" />
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import ShakingButton from './material/ShakingButton.vue'
import Dropdown from './material/Dropdown.vue'

const url_test = "http://localhost:8088/geoserver/wfs?service=wfs&version=2.0.0"+
 "&request=GetFeature&typeNames=emprisesscans&outputFormat=application/json&cql_filter="+
 "BBOX(the_geom,-9252.7093,6055896.5059,1179955.9877,7151272.0258)" +
 "%20AND%20DATE_PUB%3E2015&srsName=EPSG:3857"

 const tab_scans = ref([])
 let i = 0;

function get_tab_scans(){
  fetch(url_test).then(response =>response.json()).then(data =>{
    const newResults = data.features.map(feature =>({id:i++, name:feature.id }))
    tab_scans.value = newResults;
    console.log(tab_scans);
  })
}
onMounted(() => {
  get_tab_scans()
})
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
