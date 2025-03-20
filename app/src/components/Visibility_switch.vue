<script setup>
import { ref, watch } from 'vue';

const isVisible = ref(true);

const toggleVisibility = () => {
  isVisible.value = !isVisible.value;
};

const emit = defineEmits(['toggle-visibility']);

watch(isVisible, (newValue) => {
  // Émettre l'événement avec la nouvelle valeur
  emit('toggle-visibility', newValue);
});

const props = defineProps({
  isSidebarOpen: {
    type: Boolean,
    required: true
  }
});
</script>



<template>
    <head>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@mdi/font/css/materialdesignicons.min.css">
    </head>
    <div class="switch" :style="{ left: isSidebarOpen ? '400px' : '0' }">
        <label>
            <input type="checkbox" v-model="isVisible" @click="toggleVisibility"/>
            <span class="slider round">
                <span v-if="isVisible" class="mdi mdi-eye"></span>
                <span v-else class="mdi mdi-eye-off-outline"></span>
            </span>
        </label>
    </div>
    
</template>

<style scoped>

/* The switch - the box around the slider */
.switch {
  position: absolute;
  display: inline-block;
  width: 10vw; /* Utilisation d'une largeur relative */
  max-width: 60px; /* Limite la largeur maximale */
  height: 5vh; /* Utilisation d'une hauteur relative */
  max-height: 34px; /* Limite la hauteur maximale */
  z-index: 9999;
  top: -1vh; /* Position relative à la hauteur de l'écran */
  margin-left: 60px;
  margin-top: -10px;
}

/* Hide default HTML checkbox */
.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

/* The slider */
.slider {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem; /* Taille de police relative */
  color: black;
  background-color: #ccc;
  border-radius: 5px;
  transition: background-color 0.3s ease;
  border: solid 1px black;
}

input:checked + .slider {
  background-color: #ccc;
}

input:focus + .slider {
  box-shadow: 0 0 1px #ccc;
}

/* Rounded sliders */
.slider.round {
  border-radius: 5px;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .switch {
    width: 15vw;
    height: 6vh;
    top: 2vh;
    left: 5vw;
  }

  .slider {
    font-size: 1.2rem;
  }
}

@media (max-width: 480px) {
  .switch {
    width: 20vw;
    height: 7vh;
    top: 3vh;
    left: 3vw;
  }

  .slider {
    font-size: 1rem;
  }
}
</style>
