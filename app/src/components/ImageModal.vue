<template>
  <Teleport to="body">
    <transition name="modal-fade">
      <div v-if="isOpen" class="modal-overlay" @click="closeModal">
        <div class="modal-container" @click.stop>
          <div class="modal-header">
            <h3>{{ title }}</h3>
            <button class="modal-close-button" @click="closeModal">
              <i class="mdi mdi-close"></i>
            </button>
          </div>
          <div class="modal-body">
            <div class="image-container">
              <img
                :src="imageUrl"
                alt="Image visualisée"
                class="modal-image"
                :class="{ loading: isLoading }"
                @load="handleImageLoaded"
              />
              <div v-if="isLoading" class="loading-spinner">
                <i class="mdi mdi-loading mdi-spin"></i>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="modal-button" @click="closeModal">Fermer</button>
            <a :href="imageUrl" download class="modal-button download-button" target="_blank">
              <i class="mdi mdi-download"></i> Télécharger
            </a>
          </div>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    default: "Visualisation de l'image",
  },
})

const emit = defineEmits(['close'])

const isLoading = ref(true)

function closeModal() {
  emit('close')
}

watch(
  () => props.isOpen,
  (newValue) => {
    if (newValue === true) {
      isLoading.value = true
      document.body.classList.add('modal-open')
    } else {
      document.body.classList.remove('modal-open')
    }
  },
)

watch(
  () => props.imageUrl,
  () => {
    isLoading.value = true
  },
)

function handleImageLoaded() {
  isLoading.value = false
}

function handleKeyDown(e) {
  if (e.key === 'Escape' && props.isOpen) {
    closeModal()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
  document.body.classList.remove('modal-open')
})
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(2px);
}

.modal-container {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.2);
  width: 90%;
  max-width: 900px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #eaeaea;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.modal-close-button {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #666;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  transition: background-color 0.2s;
}

.modal-close-button:hover {
  background-color: #f0f0f0;
  color: #333;
}

.modal-body {
  padding: 20px;
  overflow-y: auto;
  flex: 1;
}

.image-container {
  position: relative;
  width: 100%;
  min-height: 300px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f8f8f8;
  border-radius: 4px;
}

.modal-image {
  max-width: 100%;
  max-height: 60vh;
  object-fit: contain;
  transition: opacity 0.3s;
}

.modal-image.loading {
  opacity: 0.3;
}

.loading-spinner {
  position: absolute;
  font-size: 48px;
  color: #739614;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 20px;
  border-top: 1px solid #eaeaea;
}

.modal-button {
  padding: 10px 18px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition:
    background-color 0.2s,
    transform 0.1s;
  display: flex;
  align-items: center;
  gap: 6px;
}

.modal-button:active {
  transform: translateY(1px);
}

.download-button {
  background-color: #739614;
  color: white;
  border: none;
  text-decoration: none;
}

.download-button:hover {
  background-color: #5e7a10;
}

.modal-button:not(.download-button) {
  background-color: #f0f0f0;
  color: #333;
  border: 1px solid #ddd;
}

.modal-button:not(.download-button):hover {
  background-color: #e5e5e5;
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

@media (max-width: 500px) {
  .modal-container {
    width: 95%;
    max-height: 95vh;
  }
}
</style>
