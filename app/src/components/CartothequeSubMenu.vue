<template>
  <div>
    <Accordion title="Critères de sélection" defaultOpen>
      <CritereSelection />
    </Accordion>

    <Accordion title="Afficher les scans" defaultOpen>
      <AfficherScans />
    </Accordion>
  </div>
</template>

<script setup>
import Accordion from './Accordeon.vue'
import CritereSelection from './CritereSelection.vue'
import AfficherScans from './AfficherScans.vue'
</script>
