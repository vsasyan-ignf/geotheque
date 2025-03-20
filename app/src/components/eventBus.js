import mitt from 'mitt'

export const eventBus = mitt()

export const appState = {
  activeSubCategory: null,
}
