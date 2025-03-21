import { defineStore } from "pinia";
import { ref } from "vue";

export const useScanStore = defineStore('scan', () => {
    let bbox = ref([])
    let url = ref('')
    let dataStore = ref(null)

    async function storeGet(url) {
        console.log('store url : ' + url)

        try {
            const response = await fetch(url)
            if (response.ok) {
                const data = await response.json()
                const carteNames = data.features.map((feature, index) => ({ id: index, name: feature.properties.ID_CARTE }))
                dataStore.value = carteNames
            } else {
                throw new Error('Failed to fetch data')
            }
        } catch (error) {
            console.error('Error:', error)
        }
    }
    return { dataStore, storeGet }
})