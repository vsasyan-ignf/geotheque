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
}

button:hover {
  animation: shake3856 0.3s linear infinite both;
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

<script setup>
import { defineProps } from 'vue'

defineProps({
  nameButton: {
    type: String,
    default: 'Aled',
  },
})
</script>

<template>
  <button>
    <slot name="icon"></slot>
    {{ nameButton }}
  </button>
</template>
