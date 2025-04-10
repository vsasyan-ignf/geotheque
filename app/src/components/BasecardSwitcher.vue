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

      <div class="layer-switcher__display-options">
        <div class="layer-switcher__options-title">Options d'affichage</div>
        <div class="checkbox-group">
          <label 
            v-for="option in checkboxOptions" 
            :key="option.key" 
            class="checkbox-label"
          >
            <input 
              type="checkbox" 
              v-model="displayOptions[option.modelKey]" 
              class="checkbox-input"
              @change="handleOptionChange(option.modelKey)"
            />
            <span class="custom-checkbox"></span>
            {{ option.label }}
          </label>
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
  initialDisplayOptions: {
    type: Object,
    default: () => ({
      couplesStero: false,
      alphanumerique: false,
      numFeuille: true,
      numDepartement: true
    })
  }
})

const emit = defineEmits(['layer-change', 'other-layer-toggle', 'display-option-change'])

const isExpanded = ref(false)
const displayOptions = ref({
  couplesStero: props.initialDisplayOptions.couplesStero,
  alphanumerique: props.initialDisplayOptions.alphanumerique,
  numFeuille: props.initialDisplayOptions.numFeuille,
  numDepartement: props.initialDisplayOptions.numDepartement
})

const checkboxOptions = [
  { key: 'couplesStereo', modelKey: 'couplesStero', label: 'Couples Stéréo' },
  { key: 'alphanumeric', modelKey: 'alphanumerique', label: 'Alphanumérique' },
  { key: 'feuilles', modelKey: 'numFeuille', label: 'N° Feuille' },
  { key: 'departements', modelKey: 'numDepartement', label: 'N° Département' },
]

const hasOtherLayers = computed(() => props.otherLayers.length > 0)

function handleLayerToggle(index) {
  const layer = props.otherLayers[index]
  layer.visible = !layer.visible

  emit('other-layer-toggle', { ...layer })
}

function handleOptionChange(option) {
  emit('display-option-change', {
    option,
    value: displayOptions.value[option]
  })
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
  width: 230px;
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
  max-height: 500px;
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

.layer-switcher__display-options {
  padding: 16px 20px;
  border-top: 1px solid #eaeaea;
  background-color: #f9f9f9;
}

.layer-switcher__options-title {
  font-size: 14px;
  font-weight: 500;
  color: #555;
  margin-bottom: 12px;
}

.checkbox-group {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #444;
  cursor: pointer;
  user-select: none;
}

.checkbox-input {
  display: none;
}

.custom-checkbox {
  width: 18px;
  height: 18px;
  border: 2px solid #ddd;
  border-radius: 4px;
  display: inline-block;
  position: relative;
  transition: all 0.2s;
}

.checkbox-input:checked + .custom-checkbox {
  background-color: #4caf50;
  border-color: #4caf50;
}

.checkbox-input:checked + .custom-checkbox::after {
  content: '';
  position: absolute;
  left: 5px;
  top: 2px;
  width: 5px;
  height: 10px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
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