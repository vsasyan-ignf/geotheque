import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import config from '@/config'
import { getEchellePhoto, getSuffixPhoto } from '../composable/paramPhoto'

export const useScanStore = defineStore('scan', () => {
  let storeBbox = ref([])
  let storeScansData = ref(null)
  let storeSelectedGeom = ref([])
  let storeSelectedScan = ref(null)
  let activeSubCategory = ref(null)
  let activeTab = ref('cartotheque')
  let wkt = ref(null)
  let urlPhoto = ref(null)
  let deletePhotoAllBool = ref(false)
  let dicoUrlPhoto = ref([])

  let collectionsOptions = ref([{ id: '0', name: 'Tous les collections' }])
  let supportOptions = ref([{ id: '0', name: 'Tous les supports' }])
  let emulsionOptions = ref([{ id: '0', name: 'Toutes les émulsions' }])

  let storeCritereSelection = ref({
    yearMin: null,
    yearMax: null,
    scaleMin: null,
    scaleMax: null,
    selectedCollection: null,
  })

  let storeURL = computed(() => {
    if (storeBbox.value.length > 0) {
      let empriseURL = 'emprisesscans'
      let [minX, minY, maxX, maxY] = storeBbox.value

      if (activeTab.value === 'cartotheque_etranger') {
        empriseURL = 'emprisesscansmonde'
          // inverse les coordonnées : lon/lat to lat/lon
          ;[minX, minY] = [minY, minX]
          ;[maxX, maxY] = [maxY, maxX]
      }

      const { yearMin, yearMax, scaleMin, scaleMax, selectedCollection } =
        storeCritereSelection.value

      let cqlFilter = `BBOX(the_geom,${minX},${minY},${maxX},${maxY})`

      if (activeTab.value === 'cartotheque_etranger') {
        if (activeSubCategory.value === 'pays') {
          cqlFilter = `INTERSECTS(the_geom,${wkt.value})`

          // if (commanditaire) cqlFilter += `%20AND%20COMMANDITA%3D'${commanditaire}'`
          // if (producteur) cqlFilter += `%20AND%20PRODUCTEUR%3D'${producteur}'`
        }
      }

      if (yearMin) cqlFilter += `%20AND%20DATE_PUB%3E%3D${yearMin}`
      if (yearMax) cqlFilter += `%20AND%20DATE_FIN%3C%3D${yearMax}`
      if (scaleMin) cqlFilter += `%20AND%20ECHELLE%3E%3D${scaleMin}`
      if (scaleMax) cqlFilter += `%20AND%20ECHELLE%3C%3D${scaleMax}`

      if (selectedCollection) cqlFilter += `%20AND%20COLLECTION%3D'${selectedCollection}'`

      if (activeTab.value === 'phototheque') {
        empriseURL = 'PVALambert93'
        cqlFilter = `BBOX(the_geom,${minX},${minY},${maxX},${maxY})`
      }

      return (
        `${config.GEOSERVER_URL}/wfs?service=wfs&version=2.0.0` +
        `&request=GetFeature&typeNames=${empriseURL}&outputFormat=application/json` +
        `&cql_filter=${cqlFilter}` +
        `&srsName=EPSG:3857`
      )
    }
    return ''
  })

  function updateScaleRange() {
    if (activeTab.value === 'cartotheque') {
      storeCritereSelection.value.scaleMin = storeCritereSelection.value.scaleMin ?? 500
      storeCritereSelection.value.scaleMax = storeCritereSelection.value.scaleMax ?? 100000
    } else if (activeTab.value === 'cartotheque_etranger') {
      storeCritereSelection.value.scaleMin = storeCritereSelection.value.scaleMin ?? 500
      storeCritereSelection.value.scaleMax = storeCritereSelection.value.scaleMax ?? 200000
    } else if (activeTab.value === 'phototheque') {
      storeCritereSelection.value.scaleMin = storeCritereSelection.value.scaleMin ?? 500
      storeCritereSelection.value.scaleMax = storeCritereSelection.value.scaleMax ?? 100000
    } else if (activeTab.value === 'cartotheque_etranger') {
      storeCritereSelection.value.scaleMin = storeCritereSelection.value.scaleMin ?? 2000
      storeCritereSelection.value.scaleMax = storeCritereSelection.value.scaleMax ?? 10000000
    } else {
      storeCritereSelection.value.scaleMin = null
      storeCritereSelection.value.scaleMax = null
    }
  }

  function updateBbox(newBbox) {
    storeBbox.value = newBbox
  }

  function updateCriteria(newCriteria) {
    storeCritereSelection.value = { ...newCriteria }
    console.log('Updated criteria:', storeCritereSelection.value)
  }

  function updateActiveSubCategory(subCategory) {
    activeSubCategory.value = subCategory
    updateScaleRange()
  }

  function resetCriteria() {
    storeCritereSelection.value = {
      yearMin: null,
      yearMax: null,
      scaleMin: null,
      scaleMax: null,
      selectedCollection: null,
    }

    storeSelectedGeom.value = []
    storeBbox.value = []
    storeScansData.value = []
    storeSelectedScan.value = null
    urlPhoto.value = null
  }

  function updateSelectedGeom(newVal) {
    storeSelectedGeom.value = newVal
  }

  function updateSelectedScan(newVal) {
    console.log('updateSelectedScan', newVal)
    storeSelectedScan.value = newVal
  }

  function updateActiveTab(newVal) {
    activeTab.value = newVal
    fetchAllOptions()
    console.log('tab selected : ', activeTab.value)
  }

  function updateWKT(newVal) {
    wkt.value = newVal
  }

  function updateUrlPhoto(newVal) {
    urlPhoto.value = newVal
  }

  function updateDeletePhotoAllBool(newVal) {
    deletePhotoAllBool.value = newVal
  }

  function updateDicoUrlPhoto(newVal) {
    dicoUrlPhoto.value.push(newVal)
  }

  async function fetchOptions(propertyName) {
    try {
      let typeNames = 'fondcarte:emprisesscans'

      if (activeTab.value === 'cartotheque_etranger') {
        typeNames = 'fondcarte:emprisesscansmonde'
      } else if (activeTab.value === 'phototheque' || activeTab.value === 'phototheque_etranger') {
        typeNames = 'fondcarte:PVALambert93'
      }

      const wfsUrl = `${config.GEOSERVER_URL}/wfs?service=WFS&version=2.0.0&request=GetFeature&typeNames=${typeNames}&propertyName=${propertyName}&outputFormat=application/json`

      const response = await fetch(wfsUrl)
      if (!response.ok) throw new Error(response.status)

      const data = await response.json()
      const values = data.features.map((f) => f.properties[propertyName]).filter(Boolean)
      const unique = [...new Set(values)].sort()

      const defaultOption = { id: '0', name: `Tous les ${propertyName.toLowerCase()}s` }

      return [defaultOption, ...unique.map((val, i) => ({ id: String(i + 1), name: val }))]
    } catch (error) {
      console.error(`Erreur fetchOptions ${propertyName} :`, error)
      return []
    }
  }

  async function fetchAllOptions() {
    if (activeTab.value === 'cartotheque' || activeTab.value === 'cartotheque_etranger') {
      collectionsOptions.value = await fetchOptions('COLLECTION')
    }

    if (activeTab.value === 'phototheque' || activeTab.value === 'phototheque_etranger') {
      supportOptions.value = await fetchOptions('SUPPORT')
      emulsionOptions.value = await fetchOptions('EMULSION')
    }
  }

  async function storeGet(url) {
    if (!url) {
      return
    }
    if (activeTab.value === 'phototheque') {
      await storeGetPhoto(url)
    } else {
      try {
        const response = await fetch(url)
        if (response.ok) {
          const data = await response.json()
          storeScansData.value = data.features.map((feature, index) => ({
            id: index,
            geom: feature.geometry.coordinates[0],
            name: feature.properties.ID_CARTE ?? feature.properties.NOM, // si ID.CARTE est undefined, on prend la prop NOM qui correspond à la prop des photos
            properties: feature.properties,
          }))
          storeSelectedScan.value = null
        } else {
          throw new Error('Failed to fetch data')
        }
      } catch (error) {
        console.error('Error:', error)
      }
    }
  }



  async function storeGetPhoto(url) {
    //Sert a récupérer les infos et ajouter une echelle dans les propriétés ainsi que le nom complet à la place du nom classique
    try {
      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        storeScansData.value = data.features.map((feature, index) => {
          feature.properties['ECHELLE'] = getEchellePhoto(feature)
          const name = feature.properties.CHANTIER + getSuffixPhoto(feature)
          return {
            id: index,
            geom: feature.geometry.coordinates[0],
            name: name,
            properties: feature.properties,
          }
        })
        console.log(storeScansData.value)
        storeSelectedScan.value = null
      } else {
        throw new Error('Failed to fetch data')
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  fetchAllOptions()

  return {
    storeScansData,
    storeBbox,
    storeURL,
    storeGet,
    updateBbox,
    updateSelectedScan,
    storeSelectedScan,
    storeCritereSelection,
    updateCriteria,
    updateActiveSubCategory,
    activeSubCategory,
    storeSelectedGeom,
    storeGetPhoto,
    updateSelectedGeom,
    resetCriteria,
    activeTab,
    updateActiveTab,
    wkt,
    updateWKT,
    urlPhoto,
    updateUrlPhoto,
    collectionsOptions,
    fetchOptions,
    supportOptions,
    emulsionOptions,
    fetchAllOptions,
    deletePhotoAllBool,
    updateDeletePhotoAllBool,
    dicoUrlPhoto,
    updateDicoUrlPhoto,
  }
})
