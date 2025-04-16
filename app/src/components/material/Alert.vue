<template>
    <Teleport to="body">
      <div class="alert-container" v-if="isVisible">
        <div 
          class="alert"
          :class="{ 
            'alert-error': type === 'error',
            'alert-success': type === 'success',
            'alert-warning': type === 'warning',
            'alert-info': type === 'info'
          }"
        >
          <div class="alert-icon">
            <SvgIcon v-if="type === 'error'" :path="mdiAlertCircle" type="mdi" />
            <SvgIcon v-else-if="type === 'success'" :path="mdiCheckCircle" type="mdi" />
            <SvgIcon v-else-if="type === 'warning'" :path="mdiAlert" type="mdi" />
            <SvgIcon v-else-if="type === 'info'" :path="mdiInformation" type="mdi" />
          </div>
          <div class="alert-content">
            <div v-if="title" class="alert-title">{{ title }}</div>
            <div class="alert-message">
              <slot></slot>
            </div>
          </div>
          <div v-if="dismissible" class="alert-close" @click="closeAlert">
            <SvgIcon :path="mdiClose" type="mdi" />
          </div>
          <div class="alert-progress-container">
            <div 
              class="alert-progress" 
              :style="{ width: `${progressWidth}%` }"
            ></div>
          </div>
        </div>
      </div>
    </Teleport>
</template>
  
<script setup>
import { mdiAlertCircle, mdiCheckCircle, mdiAlert, mdiInformation, mdiClose } from '@mdi/js'
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'

const props = defineProps({
  type: {
    type: String,
    default: 'info',
    validator: (value) => ['error', 'success', 'warning', 'info'].includes(value)
  },
  title: {
    type: String,
    default: ''
  },
  show: {
    type: Boolean,
    default: true
  },
  dismissible: {
    type: Boolean,
    default: false
  },
  duration: {
    type: Number,
    default: 5000
  },
  persistent: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close'])

const isVisible = ref(props.show)
const progressWidth = ref(100)
let timer = null
let progressInterval = null

const closeAlert = () => {
  isVisible.value = false
  emit('close')
  clearTimers()
}

const clearTimers = () => {
  if (timer) clearTimeout(timer)
  if (progressInterval) clearInterval(progressInterval)
}

const startTimer = () => {
  if (props.persistent) return
  
  clearTimers()
  
  const intervalDuration = 50
  const iterations = props.duration / intervalDuration
  const decrementValue = 100 / iterations
  
  progressWidth.value = 100
  
  progressInterval = setInterval(() => {
    progressWidth.value = Math.max(0, progressWidth.value - decrementValue)
  }, intervalDuration)
  
  timer = setTimeout(() => {
    closeAlert()
  }, props.duration)
}

watch(() => props.show, (newVal) => {
  isVisible.value = newVal
  if (newVal) {
    startTimer()
  } else {
    clearTimers()
  }
})

onMounted(() => {
  if (props.show && !props.persistent) {
    startTimer()
  }
})

onBeforeUnmount(() => {
  clearTimers()
})
</script>

<style scoped>
.alert-container {
  position: fixed;
  top: 20px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  z-index: 9999;
  pointer-events: none;
}

.alert {
  position: relative;
  display: flex;
  align-items: flex-start;
  padding: 16px;
  border-radius: 8px;
  width: 100%;
  max-width: 480px;
  margin: 0 16px;
  animation: slideDown 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  pointer-events: auto;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.alert-icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  margin-right: 12px;
}

.alert-content {
  flex: 1;
}

.alert-title {
  font-weight: 600;
  margin-bottom: 4px;
}

.alert-message {
  font-size: 14px;
  line-height: 1.5;
}

.alert-close {
  flex-shrink: 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  padding: 4px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.alert-close:hover {
  background-color: rgba(0, 0, 0, 0.1);
}

.alert-progress-container {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background-color: rgba(0, 0, 0, 0.1);
}

.alert-progress {
  height: 100%;
  transition: width 0.05s linear;
}

.alert-error {
  background-color: #fef2f2;
  border: 1px solid #fee2e2;
  color: #991b1b;
}

.alert-success {
  background-color: #f0fdf4;
  border: 1px solid #dcfce7;
  color: #166534;
}

.alert-warning {
  background-color: #fffbeb;
  border: 1px solid #fef3c7;
  color: #854d0e;
}

.alert-info {
  background-color: #eff6ff;
  border: 1px solid #dbeafe;
  color: #1e40af;
}

.alert-error .alert-icon {
  color: #dc2626;
}

.alert-success .alert-icon {
  color: #16a34a;
}

.alert-warning .alert-icon {
  color: #eab308;
}

.alert-info .alert-icon {
  color: #3b82f6;
}

.alert-error .alert-progress {
  background-color: #dc2626;
}

.alert-success .alert-progress {
  background-color: #16a34a;
}

.alert-warning .alert-progress {
  background-color: #eab308;
}

.alert-info .alert-progress {
  background-color: #3b82f6;
}
</style>