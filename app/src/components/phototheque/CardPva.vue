<template>

<div>
      <div class="mission-card">
        <div class="preview-details">
          <div v-for="(val, key, index) in essentialDetails" :key="key" class="detail-item"
            :style="{ 'animation-delay': `${index * 0.05}s` }">
            <div class="detail-label">{{ key }}</div>
            <div class="detail-value">{{ val }}</div>
          </div>
        </div>

        <div class="action-buttons">
          <button class="view-details-button" @click="openModal">Voir tous les détails</button>
        </div>
      </div>
    </div>


</template>