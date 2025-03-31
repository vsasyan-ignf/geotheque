<!-- faudra changer la logique de goToPoint dans ce composant pour les submits des résultats -->
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

    <FeuilleSearch v-if="activeSubCategory === 'feuilles'" @close="$emit('close-sub-category')" />

    <PointSearch v-if="activeSubCategory === 'point'" @close="$emit('close-sub-category')" />
  </div>
</template>

<script setup>
import { watch } from 'vue'
import { eventBus } from '@/components/composable/eventBus'
import { useScanStore } from '@/components/store/scan'
import { mdiCity, mdiMap, mdiCrosshairsGps, mdiLeaf } from '@mdi/js'

import CommuneSearch from '../cartotheque/CommuneSearch.vue'
import DepartementSearch from '../cartotheque/DepartementSearch.vue'
import FeuilleSearch from '../cartotheque/FeuilleSearch.vue'
import PointSearch from '../cartotheque/PointSearch.vue'

const scanStore = useScanStore()

const mdiIcons = {
  commune: mdiCity,
  departement: mdiMap,
  feuille: mdiLeaf,
  point: mdiCrosshairsGps,
  autre: mdiCrosshairsGps,
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
  if (point.bboxLambert93) {
    scanStore.updateBbox(point.bboxLambert93)
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
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
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
  width: calc(33.33% - 20px);
}

.sub-category:nth-child(n + 4) {
  width: calc(50% - 20px);
  max-width: calc(33.33% - 20px);
}

.sub-categories-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.sub-category:hover {
  background-color: #f0f0f0;
  transform: scale(1.05);
}

.sub-category:nth-child(n + 4):hover {
  transform: scale(1.05);
}

.icon {
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

.sub-category:nth-child(n + 4):hover .icon {
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
</style>
