<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
const emit = defineEmits(['click']);

const props = defineProps({
  nameButton: {
    type: String,
    default: 'Aled',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  tooltip: {
    type: String,
    default: '',
  }
});

const buttonRef = ref(null);
const showTooltip = ref(false);
const tooltipPosition = ref({ top: 0, left: 0 });

function handleMouseEnter() {
  if (props.tooltip) {
    updatePosition();
    showTooltip.value = true;
  }
}

function handleMouseLeave() {
  showTooltip.value = false;
}

function updatePosition() {
  if (!buttonRef.value) return;
  
  const rect = buttonRef.value.getBoundingClientRect();
  tooltipPosition.value = {
    top: rect.top - 10,
    left: rect.left + rect.width / 2
  };
}

onMounted(() => {
  if (props.tooltip) {
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
  }
});

onBeforeUnmount(() => {
  if (props.tooltip) {
    window.removeEventListener('resize', updatePosition);
    window.removeEventListener('scroll', updatePosition, true);
  }
});
</script>

<template>
  <button 
    ref="buttonRef" 
    :disabled="disabled"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <slot name="icon"></slot>
    {{ nameButton }}
  </button>
  
  <Teleport to="body">
    <div 
      v-if="tooltip && showTooltip" 
      class="shaking-tooltip"
      :style="{
        top: `${tooltipPosition.top}px`,
        left: `${tooltipPosition.left}px`
      }"
    >
      {{ tooltip }}
      <div class="tooltip-arrow"></div>
    </div>
  </Teleport>
</template>

<style scoped>
button {
  padding: 10px 15px;
  border: none;
  display: flex;
  gap: 8px;
  border-radius: 4px;
  background: #739614;
  font-size: 14px;
  color: #ffffff;
  font-family: inherit;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

button:hover:not(:disabled) {
  animation: shake3856 0.3s linear infinite both;
}

button:disabled {
  background: #b0c080;
  cursor: not-allowed;
  animation: none;
  opacity: 0.7;
}

@keyframes shake3856 {
  0% {
    -webkit-transform: translate(0);
    transform: translate(0);
  }
  20% {
    -webkit-transform: translate(-2px, 2px);
    transform: translate(-2px, 2px);
  }
  40% {
    -webkit-transform: translate(-2px, -2px);
    transform: translate(-2px, -2px);
  }
  60% {
    -webkit-transform: translate(2px, 2px);
    transform: translate(2px, 2px);
  }
  80% {
    -webkit-transform: translate(2px, -2px);
    transform: translate(2px, -2px);
  }
  100% {
    -webkit-transform: translate(0);
    transform: translate(0);
  }
}

.shaking-tooltip {
  position: fixed;
  transform: translate(-50%, -100%);
  background-color: #739614;
  color: white;
  padding: 6px 10px;
  border-radius: 4px;
  font-size: 12px;
  pointer-events: none;
  z-index: 9999;
  max-width: 250px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  white-space: nowrap;
}

.tooltip-arrow {
  position: absolute;
  left: 50%;
  top: 100%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-top: 5px solid #739614;
}
</style>