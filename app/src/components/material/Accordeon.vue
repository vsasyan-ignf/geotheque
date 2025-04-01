<template>
  <div class="accordion">
    <div class="accordion-header" @click="toggleAccordion">
      <h4 class="accordion-title">{{ title }}</h4>
      <SvgIcon type="mdi" :path="isOpen ? mdiChevronUp : mdiChevronDown" />
    </div>
    <div class="accordion-content" :class="{ open: isOpen }">
      <slot></slot>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { mdiChevronUp, mdiChevronDown } from '@mdi/js'

const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  defaultOpen: {
    type: Boolean,
    default: false,
  },
})

const isOpen = ref(props.defaultOpen)

function toggleAccordion() {
  isOpen.value = !isOpen.value
}
</script>

<style scoped>
.accordion {
  width: 100%;
  margin-top: 20px;
  color: #333;
}

.accordion-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  border-top: 1px solid #eee;
  padding: 10px 0;
}

.accordion-header:hover .accordion-title {
  color: #739614;
}

.accordion-header i {
  color: #739614;
  font-size: 20px;
  transition: transform 0.3s ease;
}

.accordion-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0;
  transition: color 0.3s ease;
}

.accordion-content {
  max-height: 0;
  overflow: hidden;
  transition:
    max-height 0.3s ease,
    opacity 0.3s ease;
  opacity: 0;
  margin-bottom: 10px;
}

.accordion-content.open {
  max-height: 800px;
  overflow: visible;
  opacity: 1;
}
</style>
