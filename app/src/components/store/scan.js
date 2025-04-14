import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import config from '@/config'
import { getEchellePhoto, getSuffixPhoto } from '../composable/paramPhoto'

export const useScanStore = defineStore('scan', () => {
  let storeBbox = ref([])
  let storeScansData = ref(null)
  let storeSelectedGeom = ref([])
  let storeSelectedScan = ref(null)
  let storeHoveredScan = ref(null)
  let activeSubCategory = ref(null)
  let activeTab = ref('cartotheque')
  let wkt = ref(null)
  let urlPhoto = ref(null)
  let deletePhotoAllBool = ref(false)
  let dicoUrlPhoto = ref([])
  let selectedPhotos = ref([])

  let collectionsOptions = ref([{ id: '0', name: 'Toutes les collections' }])
  let supportOptions = ref([{ id: '0', name: 'Tous les supports' }])
  let emulsionOptions = ref([{ id: '0', name: 'Toutes les emulsions' }])

  let optionsCache = ref({
    collection: null,
    support: null,
    emulsion: null,
    commandita: null,
    producteur: null,
  })

  let flyTo = ref(false)

  const getCurrentTypeNames = () => {
    switch (activeTab.value) {
      case 'cartotheque_etranger':
        return 'geotheque_mtd:scans'
      case 'phototheque':
        return 'geotheque_mtd:pva'
      case 'phototheque_etranger':
        return 'geotheque_mtd:pva'
      default:
        return 'geotheque_mtd:scans'
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
    emulsion: null,
  })

  function createCqlFilter(excludeFields = []) {
    if (storeBbox.value.length === 0) return ''

    let [minX, minY, maxX, maxY] = storeBbox.value

    let cqlFilter = `BBOX(geom,${minX},${minY},${maxX},${maxY})`

    if (activeTab.value === 'cartotheque_etranger' && activeSubCategory.value === 'pays') {
        cqlFilter = `INTERSECTS(geom,${wkt.value})`
    }

    const {
        yearMin,
        yearMax,
        scaleMin,
        scaleMax,
        collection,
        commanditaire,
        producteur,
        support,
        emulsion,
    } = storeCritereSelection.value

    if (yearMin) cqlFilter += `%20AND%20date_pub%3E%3D${yearMin}`
    if (yearMax) cqlFilter += `%20AND%20date_fin%3C%3D${yearMax}`

    if (scaleMin && scaleMax) {
        cqlFilter += `%20AND%20echelle%20BETWEEN%20${scaleMin}%20AND%20${scaleMax}`
    } else if (scaleMin && !scaleMax) {
        cqlFilter += `%20AND%20echelle%3E%3D${scaleMin}`
    } else if (scaleMax && !scaleMin) {
        cqlFilter += `%20AND%20echelle%3C%3D${scaleMax}`
    }

    if (collection && !excludeFields.includes('collection')) 
        cqlFilter += `%20AND%20collection%3D'${collection}'`

    if (activeTab.value.includes('phototheque')) {
        cqlFilter = `BBOX(geom,${minX},${minY},${maxX},${maxY})`
        if (commanditaire && !excludeFields.includes('commandita')) 
            cqlFilter += `%20AND%20commandita%3D'${commanditaire}'`
        if (producteur && !excludeFields.includes('producteur')) 
            cqlFilter += `%20AND%20producteur%3D'${producteur}'`
        if (support && !excludeFields.includes('support')) 
            cqlFilter += `%20AND%20support%3D'${support}'`
        if (emulsion && !excludeFields.includes('emulsion')) 
            cqlFilter += `%20AND%20emulsion%3D'${emulsion}'`
    }

    return cqlFilter
}

  let storeURL = computed(() => {
    if (storeBbox.value.length > 0) {
      let empriseURL = getCurrentTypeNames()
      let cqlFilter = createCqlFilter()

      return (
        `${config.GEOSERVER_URL}` +
        `&request=GetFeature&typeNames=${empriseURL}&outputFormat=application/json` +
        `&cql_filter=${cqlFilter}` +
        `&apikey=${config.APIKEY}`
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
      storeCritereSelection.value.scaleMax = storeCritereSelection.value.scaleMax ?? 10000000
    } else {
      storeCritereSelection.value.scaleMin = null
      storeCritereSelection.value.scaleMax = null
    }
  }

  function updateBbox(newBbox) {
    storeBbox.value = newBbox
    fetchAllOptions()
  }

  function updateCriteria(newCriteria) {
    storeCritereSelection.value = { ...newCriteria }
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

    updateScaleRange()

    storeSelectedGeom.value = []
    storeBbox.value = []
    storeScansData.value = []
    storeSelectedScan.value = null
    urlPhoto.value = null
    dicoUrlPhoto.value = []
    selectedPhotos.value = []

    collectionsOptions.value = [{ id: '0', name: 'Toutes les collections' }]
    supportOptions.value = [{ id: '0', name: 'Tous les supports' }]
    emulsionOptions.value = [{ id: '0', name: 'Toutes les emulsions' }]
  }

  function updateSelectedGeom(newVal) {
    storeSelectedGeom.value = newVal
  }

  function updateSelectedScan(newVal) {
    storeSelectedScan.value = newVal
  }

  function updateHoverScan(newVal) {
    storeHoveredScan.value = newVal
  }

  function updateActiveTab(newVal) {
    activeTab.value = newVal
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

  function updateSelectedPhotos(newVal) {
    if (!selectedPhotos.value.includes(newVal)) {
      selectedPhotos.value.push(newVal)
    }
  }

  function updateFlyTo(newVal) {
    flyTo.value = newVal
  }

  function removeSelectedPhoto(item) {
    const index = selectedPhotos.value.findIndex((photo) => photo.nom === item.nom)

    if (index !== -1) {
      selectedPhotos.value.splice(index, 1)
    }
  }

  async function fetchOptionsDropDown(propertyName) {
    try {
      let typeNames = getCurrentTypeNames()
      let cqlFilter = ''

      if (storeBbox.value.length > 0) {
        cqlFilter = createCqlFilter()
      }

      let wfsUrl = `${config.GEOSERVER_URL}&request=GetFeature&typeNames=${typeNames}&propertyName=${propertyName}&outputFormat=application/json&apikey=${config.APIKEY}`

      if (cqlFilter) {
        wfsUrl += `&cql_filter=${cqlFilter}`
      }

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
      collectionsOptions.value = await fetchOptionsDropDown('collection')
    }

    if (activeTab.value === 'phototheque' || activeTab.value === 'phototheque_etranger') {
      supportOptions.value = await fetchOptionsDropDown('support')
      emulsionOptions.value = await fetchOptionsDropDown('emulsion')
    }
  }

  async function fetchOptionsComboBox(propertyName) {
    try {
      let typeNames = getCurrentTypeNames()
      let cqlFilter = ''

      if (storeBbox.value.length > 0) {
        cqlFilter = createCqlFilter([propertyName])
      }

      let wfsUrl = `${config.GEOSERVER_URL}&request=GetFeature&typeNames=${typeNames}&propertyName=${propertyName}&outputFormat=application/json&apikey=${config.APIKEY}`

      if (cqlFilter) {
        wfsUrl += `&cql_filter=${cqlFilter}`
      }

      const response = await fetch(wfsUrl)

      const data = await response.json()

      const values = data.features
        .map((feature) => feature.properties[propertyName])
        .filter((value) => value)

      const uniqueValues = [...new Set(values)].sort()

      const options = [
        ...uniqueValues.map((value, index) => ({ id: String(index + 1), name: value })),
      ]
      optionsCache.value[propertyName] = options

      return options
    } catch (error) {
      console.error(`${propertyName}:`, error)
    }
  }

  function getFilteredOptions(options, searchTerm) {
    if (!searchTerm) return options

    return options.filter((option) =>
      typeof option === 'string'
        ? option.toLowerCase().includes(searchTerm.toLowerCase())
        : option.name.toLowerCase().includes(searchTerm.toLowerCase()),
    )
  }

  async function getCommanditaireOptions(searchTerm = '') {
    const options = await fetchOptionsComboBox('commandita')
    const filteredOptions = getFilteredOptions(options, searchTerm)
    return filteredOptions && filteredOptions.map((option) => option.name)
  }

  async function getProducteurOptions(searchTerm = '') {
    const options = await fetchOptionsComboBox('producteur')
    const filteredOptions = getFilteredOptions(options, searchTerm)
    return filteredOptions && filteredOptions.map((option) => option.name)
  }

  async function storeGet(url) {
    if (!url) {
      return
    }
    if (activeTab.value.includes('phototheque')) {
      await storeGetPhoto(url)
    } else {
      try {
        const response = await fetch(url)
        if (response.ok) {
          const data = await response.json()
          storeScansData.value = data.features.map((feature, index) => ({
            id: index,
            geom: feature.geometry.coordinates,
            name: feature.properties.id_carte,
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
          feature.properties['echelle'] = getEchellePhoto(feature)
          const name = feature.properties.chantier + getSuffixPhoto(feature)
          return {
            id: index,
            geom: feature.geometry.coordinates,
            name: name,
            properties: feature.properties,
          }
        })
        storeSelectedScan.value = null
      } else {
        throw new Error('Failed to fetch data')
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

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
    deletePhotoAllBool,
    updateDeletePhotoAllBool,
    dicoUrlPhoto,
    updateDicoUrlPhoto,
    getCommanditaireOptions,
    getProducteurOptions,
    getFilteredOptions,
    storeHoveredScan,
    updateHoverScan,
    selectedPhotos,
    updateSelectedPhotos,
    removeSelectedPhoto,
    flyTo,
    updateFlyTo,
  }
})
