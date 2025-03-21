import { defineStore } from "pinia";
import { ref, computed } from "vue";

export const useScanStore = defineStore('scan', () => {
    let storeBbox = ref([])
    let storeData = ref(null)


    let storeURL = computed(() => {
        if (storeBbox.value.length > 0) {
            const [minX, minY, maxX, maxY] = storeBbox.value;

            return `http://localhost:8088/geoserver/wfs?service=wfs&version=2.0.0` +
                `&request=GetFeature&typeNames=emprisesscans&outputFormat=application/json` +
                `&cql_filter=BBOX(the_geom,${minX},${minY},${maxX},${maxY})` +
                `%20&srsName=EPSG:3857`;
        }
        return '';
    });

    function updateBbox(newBbox) {
        storeBbox.value = newBbox;
    }

    async function storeGet(url) {
        try {
            const response = await fetch(url)
            if (response.ok) {
                const data = await response.json()
                const carteNames = data.features.map((feature, index) => ({ id: index, name: feature.properties.ID_CARTE }))
                storeData.value = carteNames
            } else {
                throw new Error('Failed to fetch data')
            }
        } catch (error) {
            console.error('Error:', error)
        }
    }
    return { storeData, storeBbox, storeURL, storeGet, updateBbox }
})