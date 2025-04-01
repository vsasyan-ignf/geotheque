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

      <div v-if="hasOtherLayers" class="layer-switcher__other-layers-section">
        <div class="layer-switcher__other-layers-title">Autres couches</div>
        <div class="layer-switcher__other-layers-list">
          <div
            v-for="(layer, index) in otherLayers"
            :key="'other-' + layer.id"
            class="layer-switcher__other-layer"
            :class="{
              'layer-switcher__other-layer--disabled': layer.id === 'communes' && currentZoom <= 11,
            }"
          >
            <div class="layer-switcher__other-layer-content">
              <img :src="layer.thumbnail" alt="" class="layer-switcher__thumbnail" />
              <span class="layer-switcher__label">
                {{ layer.name }}
                <span v-if="layer.id === 'communes'" class="layer-switcher__zoom-hint">
                  (Zoom requis)
                </span>
              </span>
            </div>
            <div
              class="layer-switcher__layer-switch"
              :class="{
                'layer-switcher__layer-switch--active': layer.visible,
                'layer-switcher__layer-switch--disabled':
                  layer.id === 'communes' && currentZoom <= 11,
              }"
              @click="handleLayerToggle(index)"
            >
              <div class="layer-switcher__layer-switch-handle"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  layers: {
    type: Array,
    required: true,
  },
  otherLayers: {
    type: Array,
    required: true,
  },
  activeLayerIndex: {
    type: Number,
    default: 0,
  },
  currentZoom: Number,
})

const emit = defineEmits(['layer-change', 'other-layer-toggle'])

const isExpanded = ref(false)

const hasOtherLayers = computed(() => props.otherLayers.length > 0)

function handleLayerToggle(index) {
  const layer = props.otherLayers[index]
  layer.visible = !layer.visible

  emit('other-layer-toggle', { ...layer })
}

function toggleExpand() {
  isExpanded.value = !isExpanded.value
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
  transition: all 0.3s ease;
}

.layer-switcher--expanded {
  width: 230px;
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

.layer-switcher__other-layers-section {
  background-color: white;
  border-top: 1px solid #e0e0e0;
  max-width: 100%;
}

.layer-switcher__other-layers-title {
  padding: 12px 14px;
  font-size: 13px;
  font-weight: 600;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.layer-switcher__other-layers-list {
  padding: 0 14px 14px;
  max-width: 100%;
}

.layer-switcher__other-layer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
  width: 100%;
}

.layer-switcher__other-layer-content {
  display: flex;
  align-items: center;
  flex-grow: 1;
  overflow: hidden;
  max-width: calc(100% - 50px);
}

.layer-switcher__layer-switch {
  width: 42px;
  height: 22px;
  background-color: #e0e0e0;
  border-radius: 11px;
  position: relative;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.layer-switcher__layer-switch-handle {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 18px;
  height: 18px;
  background-color: white;
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  transition: transform 0.3s ease;
}

.layer-switcher__layer-switch--active {
  background-color: #4caf50;
}

.layer-switcher__layer-switch--active .layer-switcher__layer-switch-handle {
  transform: translateX(20px);
}

.layer-switcher__other-layer--disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.layer-switcher__layer-switch--disabled {
  cursor: not-allowed;
  pointer-events: none;
}

.layer-switcher__zoom-hint {
  font-size: 0.8em;
  color: #888;
  margin-left: 5px;
}
</style>
