import mitt from 'mitt'
import { ref } from 'vue';

export const eventBus = mitt()
export const bboxState = ref(null);

export const appState = {
  activeSubCategory: null,
}
