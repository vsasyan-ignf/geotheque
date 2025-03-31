<script setup>
defineProps({
  nameButton: {
    type: String,
    default: 'Aled',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
})
</script>

<template>
  <button :disabled="disabled">
    <slot name="icon"></slot>
    {{ nameButton }}
  </button>
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
</style>
