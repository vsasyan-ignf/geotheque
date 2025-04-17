<template>
  <div class="custom-dropdown" v-click-outside="closeDropdown" ref="dropdownRef">
    <label v-if="nameDropdown">{{ nameDropdown }}</label>
    <div class="dropdown-selected" @click="toggleDropdown">
      <span class="selected-text">{{
        selected ? selected.name : disableOption || 'Sélectionner'
      }}</span>
      <span class="dropdown-arrow" :class="{ open: isOpen }">▼</span>
    </div>
    <div
      class="dropdown-options"
      :class="{ show: isOpen, 'dropdown-up': shouldShowAbove }"
      @mouseleave="resetHover"
    >
      <div
        v-for="option in options"
        :key="option.id"
        class="dropdown-option"
        @click="selectOption(option)"
        @mouseenter="handleOptionHover(option)"
      >
        {{ option.name }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watchEffect, onMounted, nextTick } from 'vue'
import { eventBus } from '../composable/eventBus'
import { useScanStore } from '../store/scan'
import { debounce } from 'lodash'

const scanStore = useScanStore()
const dropdownRef = ref(null)
const shouldShowAbove = ref(false)

const props = defineProps({
  nameDropdown: {
    type: String,
    default: '',
  },
  options: {
    type: Array,
    default: [
      { id: 'EPSG:3857', name: 'Web Mercator' },
      { id: 'EPSG:4326', name: 'WGS 84' },
      { id: 'EPSG:2154', name: 'Lambert 93' },
    ],
  },
  disableOption: {
    type: String,
  },
  defaultValue: {
    type: Object,
  },
})

const selected = ref('')
const isOpen = ref(false)
const emit = defineEmits(['update:selected', 'option-hover'])

/**
 * Vérifie si le dropdown doit s'afficher au-dessus ou en dessous
 */
function checkPosition() {
  if (!dropdownRef.value) return

  nextTick(() => {
    const dropdownRect = dropdownRef.value.getBoundingClientRect()
    const dropdownHeight = 250
    const windowHeight = window.innerHeight
    const bottomSpace = windowHeight - dropdownRect.bottom

    shouldShowAbove.value = bottomSpace < dropdownHeight && dropdownRect.top > dropdownHeight
  })
}

/**
 * Gère le clic à l'extérieur du dropdown
 * @param {Event} event
 */
function toggleDropdown() {
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    checkPosition()
  }
}

/**
 * Ferme le dropdown
 */
function closeDropdown() {
  if (isOpen.value) {
    isOpen.value = false
    resetHover()
  }
}

/**
 * Sélectionne une option dans le dropdown
 * @param option 
 */
function selectOption(option) {
  selected.value = option
  isOpen.value = false
  emit('update:selected', option)

  scanStore.updateHoverScan(null)
  if (props.nameDropdown !== 'Collections') {
    scanStore.updateSelectedScan(option)
  }
}

/** 
 * Met à jour l'option survolée
*/
const debouncedHoverUpdate = debounce((option) => {
  scanStore.updateHoverScan(option)
}, 0)

/**
 * Gère le survol d'une option
 * @param option 
 */
function handleOptionHover(option) {
  if (props.nameDropdown !== 'Support' || props.nameDropdown !== 'Emulsion') {
    debouncedHoverUpdate(option)
  }
}

/**
 * Réinitialise l'option survolée
 */
function resetHover() {
  scanStore.updateHoverScan(null)
  if (selected.value) {
    scanStore.updateSelectedScan(selected.value)
  }
}

watchEffect(() => {
  if (props.defaultValue) {
    selected.value = props.defaultValue
  }
})

eventBus.on('criteria-reset', () => {
  if (props.defaultValue) {
    selected.value = props.defaultValue
  } else {
    selected.value = ''
  }
})

onMounted(() => {
  window.addEventListener('resize', checkPosition)
})

/**
 * Nettoie l'écouteur d'événements lors du démontage
 */
const vClickOutside = {
  mounted(el, binding) {
    el._clickOutside = (event) => {
      if (!(el === event.target || el.contains(event.target))) {
        binding.value(event)
      }
    }
    document.addEventListener('click', el._clickOutside)
  },
  unmounted(el) {
    document.removeEventListener('click', el._clickOutside)
  },
}
</script>

<style scoped>
.custom-dropdown {
  display: flex;
  flex-direction: column;
  gap: 5px;
  position: relative;
  width: 100%;
}

.custom-dropdown label {
  font-size: 12px;
  color: #555;
}

.dropdown-selected {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  background-color: white;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dropdown-arrow {
  font-size: 12px;
  color: #666;
  transition: transform 0.3s;
}

.dropdown-arrow.open {
  transform: rotate(180deg);
}

.dropdown-options {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  max-height: 0;
  overflow-y: auto;
  background-color: white;
  border: 0 solid #ddd;
  border-radius: 0 0 6px 6px;
  opacity: 0;
  transition: all 0.3s;
  z-index: 10;
  margin-top: 5px;
  font-size: 13px;
  width: 100%;
}

.dropdown-options.show {
  max-height: 250px;
  opacity: 1;
  border-width: 1px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.dropdown-options.dropdown-up {
  top: auto;
  bottom: 100%;
  margin-top: 0;
  margin-bottom: 5px;
  border-radius: 6px 6px 0 0;
}

.dropdown-option {
  padding: 10px;
  cursor: pointer;
  transition: background-color 0.2s;
  white-space: normal;
  word-wrap: break-word;
  line-height: 1.3;
  min-height: 20px;
}

.dropdown-option:hover {
  background-color: #f5f5f5;
}

.selected-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: calc(100% - 20px);
}
</style>
