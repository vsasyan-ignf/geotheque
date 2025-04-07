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

  let collectionsOptions = ref([{ id: '0', name: 'Tous les collections' }])
  let supportOptions = ref([{ id: '0', name: 'Tous les supports' }])
  let emulsionOptions = ref([{ id: '0', name: 'Toutes les emulsions' }])

  let optionsCache = ref({
    COLLECTION: null,
    SUPPORT: null,
    EMULSION: null,
    COMMANDITA: null,
    PRODUCTEUR: null
  })

  const getCurrentTypeNames = () => {
    switch (activeTab.value) {
      case 'cartotheque_etranger':
        return 'fondcarte:emprisesscansmonde'
      case 'phototheque':
        return 'fondcarte:PVALambert93'
      case 'phototheque_etranger':
        return ''; // à modif pour prendre en compte le bon wfs
      default:
        return 'fondcarte:emprisesscans'
    }
  }

  let storeCritereSelection = ref({
    yearMin: null,
    yearMax: null,
    scaleMin: null,
    scaleMax: null,
    collection: null,
    commanditaire: null,
    producteur: null,
    support: null,
    emulsion: null
  })

  let storeURL = computed(() => {
    if (storeBbox.value.length > 0) {
      let empriseURL = getCurrentTypeNames();
      let [minX, minY, maxX, maxY] = storeBbox.value

      if (activeTab.value === 'cartotheque_etranger') {

        // inverse les coordonnées : lon/lat to lat/lon
        ;[minX, minY] = [minY, minX]
        ;[maxX, maxY] = [maxY, maxX]
      }

      const { yearMin, yearMax, scaleMin, scaleMax, collection, commanditaire, producteur, support, emulsion } =
        storeCritereSelection.value

      let cqlFilter = `BBOX(the_geom,${minX},${minY},${maxX},${maxY})`

      if (activeTab.value === 'cartotheque_etranger') {
        if (activeSubCategory.value === 'pays') {
          cqlFilter = `INTERSECTS(the_geom,${wkt.value})`
        }
      }

      if (yearMin) cqlFilter += `%20AND%20DATE_PUB%3E%3D${yearMin}`
      if (yearMax) cqlFilter += `%20AND%20DATE_FIN%3C%3D${yearMax}`
      if (scaleMin) cqlFilter += `%20AND%20ECHELLE%3E%3D${scaleMin}`
      if (scaleMax) cqlFilter += `%20AND%20ECHELLE%3C%3D${scaleMax}`

      if (collection) cqlFilter += `%20AND%20COLLECTION%3D'${collection}'`

      if (activeTab.value === 'phototheque') {
        // empriseURL = 'PVALambert93'
        cqlFilter = `BBOX(the_geom,${minX},${minY},${maxX},${maxY})`

        if (commanditaire) cqlFilter += `%20AND%20COMMANDITA%3D'${commanditaire}'`
        if (producteur) cqlFilter += `%20AND%20PRODUCTEUR%3D'${producteur}'`
        if (support) cqlFilter += `%20AND%20SUPPORT%3D'${support}'`
        if (emulsion) cqlFilter += `%20AND%20EMULSION%3D'${emulsion}'`
      }

      console.log( `${config.GEOSERVER_URL}/wfs?service=wfs&version=2.0.0` +
        `&request=GetFeature&typeNames=${empriseURL}&outputFormat=application/json` +
        `&cql_filter=${cqlFilter}` +
        `&srsName=EPSG:3857`)


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
      collection: null,
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

  async function fetchOptionsDropDown(propertyName) {
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
      console.error(`${propertyName} :`, error)
      return []
    }
  }

  async function fetchAllOptions() {
    if (activeTab.value === 'cartotheque' || activeTab.value === 'cartotheque_etranger') {
      collectionsOptions.value = await fetchOptionsDropDown('COLLECTION')
    }

    if (activeTab.value === 'phototheque' || activeTab.value === 'phototheque_etranger') {
      supportOptions.value = await fetchOptionsDropDown('SUPPORT')
      emulsionOptions.value = await fetchOptionsDropDown('EMULSION')
    }
  }

  async function fetchOptionsComboBox(propertyName) {
    if (optionsCache.value[propertyName]) {
        return optionsCache.value[propertyName];
    }

    try {
        const typeNames = getCurrentTypeNames();
        const wfsUrl = `${config.GEOSERVER_URL}/wfs?service=WFS&version=2.0.0&request=GetFeature&typeNames=${typeNames}&propertyName=${propertyName}&outputFormat=application/json`;

        const response = await fetch(wfsUrl);

        const data = await response.json();

        const values = data.features
            .map((feature) => feature.properties[propertyName])
            .filter((value) => value);

        const uniqueValues = [...new Set(values)].sort();

        const options = [...uniqueValues.map((value, index) => ({ id: String(index + 1), name: value }))];
        optionsCache.value[propertyName] = options;

        return options;
    } catch (error) {
        console.error(`${propertyName}:`, error);
    }
  }

  function getFilteredOptions(options, searchTerm) {
    if (!searchTerm) return options
    
    return options.filter(option => 
      typeof option === 'string' 
        ? option.toLowerCase().includes(searchTerm.toLowerCase())
        : option.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }

  async function getCommanditaireOptions(searchTerm = '') {
    const options = await fetchOptionsComboBox('COMMANDITA')
    const filteredOptions = getFilteredOptions(options, searchTerm)
    return filteredOptions.map(option => option.name)
  }

  async function getProducteurOptions(searchTerm = '') {
    const options = await fetchOptionsComboBox('PRODUCTEUR')
    const filteredOptions = getFilteredOptions(options, searchTerm)
    return filteredOptions.map(option => option.name)
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
    fetchOptionsDropDown,
    supportOptions,
    emulsionOptions,
    fetchAllOptions,
    getCommanditaireOptions,
    getProducteurOptions,
    getFilteredOptions
  }
})
