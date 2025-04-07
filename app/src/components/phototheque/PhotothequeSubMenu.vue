<template>
  <div>
    <Accordion title="Critère de mission" defaultOpen>
      <CritereSelection />
    </Accordion>

    <Accordion title="Mission" defaultOpen>
      <Mission />
    </Accordion>
    
  </div>
</template>

<script setup>
import Accordion from '@/components/material/Accordeon.vue'
import Mission from './Mission.vue'
import CritereSelection from '../cartotheque/CritereSelection.vue';
</script>
