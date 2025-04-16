<template>
  <div>
    <div v-if="!activeSubCategory" class="sub-categories">
      <div
        v-for="sub in subCategories"
        :key="sub.id"
        class="sub-category"
        @click="$emit('select-sub-category', sub.id)"
      >
        <SvgIcon v-if="mdiIcons[sub.icon]" :path="mdiIcons[sub.icon]" type="mdi" class="icon" />
        <span>{{ sub.title }}</span>
      </div>
    </div>
    <div v-if="!activeSubCategory">
      <div class="search-header">Cliquer sur l'un des onglets pour effectuer une recherche :</div>

      <div class="search-options">
        <div class="search-option">
          <SvgIcon :path="mdiIcons.commune" type="mdi" class="icon" />
          <span>par commune(s)</span>
        </div>

        <div class="search-option">
          <SvgIcon :path="mdiIcons.departement" type="mdi" class="icon" />
          <span>par département(s)</span>
        </div>

        <div class="search-option">
          <SvgIcon :path="mdiIcons.point" type="mdi" class="icon" />
          <span>par pointé sur la carte</span>
        </div>
      </div>
    </div>

    <CommuneSearch
      v-if="activeSubCategory === 'commune'"
      @close="$emit('close-sub-category')"
      @select-commune="goToPoint"
    />
    <DepartementSearch
      v-if="activeSubCategory === 'departement'"
      @close="$emit('close-sub-category')"
      @select-departement="goToPoint"
    />
    <PointSearch
      v-if="activeSubCategory === 'point'"
      @go-to-point="goToPoint"
      @close="$emit('close-sub-category')"
    />
  </div>
</template>

<script setup>
import { watch } from 'vue'
import CommuneSearch from '@/components/material/CommuneSearch.vue'
import DepartementSearch from '@/components/material/DepartementSearch.vue'
import PointSearch from '@/components/material/PointSearch.vue'
import { eventBus } from '@/components/composable/eventBus'
import { useScanStore } from '@/components/store/scan'
import { mdiCity, mdiMap, mdiCrosshairsGps, mdiMagnify } from '@mdi/js'

const scanStore = useScanStore()
const mdiIcons = {
  commune: mdiCity,
  departement: mdiMap,
  point: mdiCrosshairsGps,
}

const props = defineProps({
  activeSubCategory: {
    type: String,
    default: null,
  },
  subCategories: {
    type: Array,
    required: true,
  },
})

defineEmits(['select-sub-category', 'close-sub-category'])

function goToPoint(point) {
  if (point.bboxMercator) {
    scanStore.updateBbox(point.bboxMercator.bboxMercator)
  }
}

watch(
  () => props.activeSubCategory,
  (newVal) => {
    eventBus.emit('toggle-pin', newVal === 'point')
  },
)
</script>

<style scoped>
.sub-categories {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-top: 20px;
}

.sub-category {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  padding: 15px;
  border-radius: 5px;
  transition:
    background-color 0.3s,
    transform 0.3s;
}

.sub-category:hover {
  background-color: #f0f0f0;
  transform: scale(1.05);
}

.search-header {
  margin-top: 20px;
  margin-bottom: 10px;
  padding: 5px;
  font-size: 14px;
  color: #666;
}

.search-options {
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin-left: 5px;
}

.search-option {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 5px;
}

.icon {
  font-size: 16px;
  color: #739614;
}

.sub-category .icon {
  font-size: 24px;
  color: #739614;
  transition:
    color 0.3s,
    font-size 0.3s;
}

.sub-category:hover .icon {
  color: #4caf50;
  font-size: 28px;
}

.sub-category span {
  font-size: 15px;
  color: #333;
  transition: color 0.3s;
}

.sub-category:hover span {
  color: #4caf50;
}

.search-option span {
  font-size: 14px;
  color: #444;
}
</style>
