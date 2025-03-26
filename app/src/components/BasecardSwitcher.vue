<!-- <template>
  <div class="layer-switcher" :class="{ 'layer-switcher--expanded': isExpanded }">
    <div class="layer-switcher__current" @click="toggleExpand">
      <img :src="layers[activeLayerIndex].thumbnail" alt="" class="layer-switcher__thumbnail" />
      <span class="layer-switcher__label">{{ layers[activeLayerIndex].name }}</span>
      <span class="layer-switcher__toggle-icon">
        {{ isExpanded ? '▼' : '▲' }}
      </span>
    </div>
    <div v-if="isExpanded" class="layer-switcher__options">
      <div
        v-for="(layer, index) in layers"
        :key="layer.id"
        class="layer-switcher__option"
        :class="{ 'layer-switcher__option--active': index === activeLayerIndex }"
        @click="selectLayer(index)"
      >
        <img :src="layer.thumbnail" alt="" class="layer-switcher__thumbnail" />
        <span class="layer-switcher__label">{{ layer.name }}</span>
      </div>
    </div>
  </div>
</template> -->
<template>
  <div class="layer-switcher" :class="{ 'layer-switcher--expanded': isExpanded }">
    <div class="layer-switcher__current" @click="toggleExpand">
      <img
        v-if="layers[activeLayerIndex]?.thumbnail"
        :src="layers[activeLayerIndex]?.thumbnail"
        alt=""
        class="layer-switcher__thumbnail"
      />
      <span class="layer-switcher__label">
        {{ layers[activeLayerIndex]?.name || 'No layer selected' }}
      </span>
      <span class="layer-switcher__toggle-icon">
        {{ isExpanded ? '▼' : '▲' }}
      </span>
    </div>
    <div v-if="isExpanded" class="layer-switcher__options">
      <div
        v-for="(layer, index) in layers"
        :key="layer.id"
        class="layer-switcher__option"
        :class="{ 'layer-switcher__option--active': index === activeLayerIndex }"
        @click="selectLayer(index)"
      >
        <img :src="layer.thumbnail" alt="" class="layer-switcher__thumbnail" />
        <span class="layer-switcher__label">{{ layer.name }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'

const props = defineProps({
  layers: {
    type: Array,
    required: true,
  },
  activeLayerIndex: {
    type: Number,
    default: 0,
  },
})

const emit = defineEmits(['layer-change'])

const isExpanded = ref(false)

function toggleExpand() {
  isExpanded.value = !isExpanded.value
  console.log('layer value du switch', props.layers)
}

function selectLayer(index) {
  if (index !== props.activeLayerIndex) {
    emit('layer-change', index)
    isExpanded.value = false
  }
}

function handleClickOutside(event) {
  const layerSwitcher = document.querySelector('.layer-switcher')
  if (layerSwitcher && !layerSwitcher.contains(event.target) && isExpanded.value) {
    isExpanded.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.layer-switcher {
  position: absolute;
  bottom: 30px;
  right: 30px;
  width: 190px;
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  z-index: 1000;
  transition: all 0.3s ease;
}

.layer-switcher--expanded {
  width: 200px;
}

.layer-switcher__current {
  display: flex;
  align-items: center;
  padding: 14px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.layer-switcher__current:hover {
  background-color: #f5f5f5;
}

.layer-switcher__thumbnail {
  width: 42px;
  height: 42px;
  border-radius: 5px;
  object-fit: cover;
  margin-right: 12px;
  border: 1px solid #e0e0e0;
}

.layer-switcher__label {
  flex-grow: 1;
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.layer-switcher__toggle-icon {
  font-size: 12px;
  color: #666;
  margin-left: 8px;
}

.layer-switcher__options {
  /* max-height: 240px; */
  overflow-y: auto;
  border-top: 1px solid #eee;
}

.layer-switcher__option {
  display: flex;
  align-items: center;
  padding: 14px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.layer-switcher__option:hover {
  background-color: #f5f5f5;
}

.layer-switcher__option--active {
  background-color: #e3f2fd;
}
</style>
