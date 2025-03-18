<template>
    <div class="accordeon">
      <div class="accordeon-header" @click="toggleAccordeon">
        <h4 class="accordeon-title">{{ title }}</h4>
        <i class="mdi" :class="isOpen ? 'mdi-chevron-up' : 'mdi-chevron-down'"></i>
      </div>
      <div class="accordeon-content" :class="{ 'open': isOpen }">
        <slot></slot>
      </div>
    </div>
</template>
  
<script setup>
import { ref } from 'vue'
  
const props = defineProps({
    title: {
    type: String,
      required: true
    },
    defaultOpen: {
      type: Boolean,
      default: false
    }
})
  
const isOpen = ref(props.defaultOpen)
  
function toggleAccordeon() {
    isOpen.value = !isOpen.value
}
</script>
  
<style scoped>
.accordeon {
    width: 100%;
    border-top: 1px solid #eee;
    margin-top: 15px;
    padding-top: 15px;
}
  
.accordeon-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
    padding-bottom: 10px;
}
  
.accordeon-header:hover .accordeon-title {
    color: #739614;
}
  
.accordeon-header i {
    color: #739614;
    font-size: 20px;
    transition: transform 0.3s ease;
}
  
.accordeon-title {
    font-size: 16px;
    font-weight: 600;
    color: #333;
    margin: 0;
    transition: color 0.3s ease;
}
  
.accordeon-content {
    max-height: 0;
    overflow: hidden;
    transition: max-height 0.3s ease, opacity 0.3s ease;
    opacity: 0;
}
  
.accordeon-content.open {
    max-height: 800px;
    opacity: 1;
}
</style>