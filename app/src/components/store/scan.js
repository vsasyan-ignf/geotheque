import { defineStore } from "pinia";
import { ref, computed } from "vue";

export const useScanStore = defineStore('scan', () => {
    let storeBbox = ref([]);
    let storeData = ref(null);
    let storeCommuneContour = ref([]);
    let storeSelectedScan = ref(null);
    let currentCollecInfo = ref(null);
    let activeSubCategory = ref(null);


    let storeCritereSelection = ref({
        yearMin: null,
        yearMax: null,
        scaleMin: null,
        scaleMax: null
    });


    let storeURL = computed(() => {
        if (storeBbox.value.length > 0) {
            const [minX, minY, maxX, maxY] = storeBbox.value;
            const { yearMin, yearMax, scaleMin, scaleMax } = storeCritereSelection.value;

            let cqlFilter = `BBOX(the_geom,${minX},${minY},${maxX},${maxY})`;

            if (yearMin) cqlFilter += `%20AND%20DATE_PUB%3E%3D${yearMin}`;
            if (yearMax) cqlFilter += `%20AND%20DATE_FIN%3C%3D${yearMax}`;
            if (scaleMin) cqlFilter += `%20AND%20ECHELLE%3E%3D${scaleMin}`;
            if (scaleMax) cqlFilter += `%20AND%20ECHELLE%3C%3D${scaleMax}`;

            return `http://localhost:8088/geoserver/wfs?service=wfs&version=2.0.0` +
                `&request=GetFeature&typeNames=emprisesscans&outputFormat=application/json` +
                `&cql_filter=${cqlFilter}` +
                `&srsName=EPSG:3857`;
        }
        return '';
    });

    function updateBbox(newBbox) {
        storeBbox.value = newBbox;
    }

    function updateCriteria(newCriteria) {
        storeCritereSelection.value = { ...newCriteria };
        console.log("Updated criteria:", storeCritereSelection.value);
    }

    function updateActiveSubCategory(subCategory) {
        activeSubCategory.value = subCategory
        console.log('Sous-catégorie active:', activeSubCategory.value)
    }

    function updateCurrentScanInfo(collec) {
        currentCollecInfo.value = collec
        console.log('Collection actuelle:', currentCollecInfo.value)
    }

    function resetCriteria() {
        storeCritereSelection.value = {
            yearMin: null,
            yearMax: null,
            scaleMin: null,
            scaleMax: null
        };
        storeCommuneContour.value = []
        storeBbox.value = [];
        storeData.value = null;
        currentCollecInfo.value = null;
    }

    function updateCommuneContour(newVal) {
        storeCommuneContour.value = newVal
    }

    function updateSelectedScan(newVal) {
        storeSelectedScan.value = newVal
        console.log("geom selected : ", storeSelectedScan.value)
    }

    async function storeGet(url) {

        if (!url) {
            return;
        }

        try {
            const response = await fetch(url)
            if (response.ok) {
                const data = await response.json()

                const carteNames = data.features.map((feature, index) => ({ id: index, geom: feature.geometry.coordinates[0], name: feature.properties.ID_CARTE, collecInfo: feature.properties.COLLECTION + "/" + feature.properties.SOUS_COLL + "/" + feature.properties.ID_CARTE }))
                storeData.value = carteNames
            } else {
                throw new Error('Failed to fetch data')
            }
        } catch (error) {
            console.error('Error:', error)
        }
    }


    return {
        storeData,
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
        updateCurrentScanInfo,
        currentCollecInfo,
        storeCommuneContour,
        updateCommuneContour,
        resetCriteria
    };
});