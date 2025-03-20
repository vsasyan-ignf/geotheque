<!-- contenu specifique a cartothequeFrance -->

<template>
  <div>
    <div v-if="!activeSubCategory" class="sub-categories">
      <div
        v-for="sub in subCategories"
        :key="sub.id"
        class="sub-category"
        @click="$emit('select-sub-category', sub.id)"
      >
        <i :class="'mdi mdi-' + sub.icon"></i>
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
      @select-departement="goToDepartement"
    />

    <PointSearch
      v-if="activeSubCategory === 'point'"
      @close="$emit('close-sub-category')"
      @go-to-point="goToPoint"
    />
  </div>
</template>

<script setup>
import { watch } from 'vue'
import CommuneSearch from './CommuneSearch.vue'
import DepartementSearch from './DepartementSearch.vue'
import PointSearch from './PointSearch.vue'
import { eventBus } from './eventBus'

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

function goToCommune(commune) {
  console.log(`com: ${commune.nom}`)
}

function goToDepartement(departement) {
  console.log(`dep: ${departement.nom}`)
}

function goToPoint(point) {
  console.log(`x:${point.x}, y:${point.y}`)
  
  if (point.bboxLambert93) {
    console.log(point.bboxLambert93)

    eventBus.emit('bbox-updated', point.bboxLambert93);
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

.sub-category i {
  font-size: 24px;
  color: #739614;
  transition:
    color 0.3s,
    font-size 0.3s;
}

.sub-category:hover i {
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
</style>
