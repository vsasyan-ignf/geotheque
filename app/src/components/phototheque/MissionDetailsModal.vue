<template>
    <div v-if="isOpen" class="modal-overlay" @click.self="closeModal">
      <div class="modal-container">
        <div class="modal-header">
          <h2>{{ title }}</h2>
          <button class="close-button" @click="closeModal">&times;</button>
        </div>
        
        <div class="modal-content">
          <div class="details-grid">
            <div v-for="(detail, index) in details" :key="index" class="modal-detail-item">
              <div class="detail-label">{{ detail.label }}</div>
              <div class="detail-value">{{ detail.value }}</div>
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <button class="download-button" @click="downloadDetails">
            Télécharger les informations
          </button>
          <button class="close-modal-button" @click="closeModal">
            Fermer
          </button>
        </div>
      </div>
    </div>
</template>
  
<script setup>
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  details: {
    type: Array,
    required: true
  }
});

const emit = defineEmits(['close', 'download']);

const closeModal = () => {
  emit('close');
};

const downloadDetails = () => {
  emit('download');
};
</script>

<style scoped>
@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  backdrop-filter: blur(3px);
}

.modal-container {
  background-color: white;
  border-radius: 8px;
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  animation: slideInUp 0.3s ease;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #eaeaea;
}

.modal-header h2 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.close-button {
  background: none;
  border: none;
  font-size: 24px;
  color: #777;
  cursor: pointer;
  transition: color 0.2s;
}

.close-button:hover {
  color: #333;
}

.modal-content {
  padding: 20px;
  overflow-y: auto;
  flex-grow: 1;
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.detail-label {
  flex: 0 0 50%;
  font-weight: 500;
  color: #555;
  font-size: 14px;
}

.detail-value {
  flex: 0 0 60%;
  color: #333;
  font-size: 14px;
}
.modal-detail-item {
  padding: 12px;
  border-radius: 6px;
  background-color: #f8f9fa;
  transition: all 0.2s;
}

.modal-detail-item:hover {
  background-color: #edf2f7;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 20px;
  border-top: 1px solid #eaeaea;
}

.download-button {
  background-color: #739614;
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  box-shadow: 0 2px 4px rgba(115, 150, 20, 0.2);
}

.download-button:hover {
  background-color: #658612;
}

.close-modal-button {
  background-color: #f8f9fa;
  color: #666;
  border: 1px solid #ddd;
  padding: 10px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.close-modal-button:hover {
  background-color: #edf2f7;
  border-color: #c4c4c4;
}
</style>