import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import SvgIcon from '@jamescoyle/vue-icon'

const app = createApp(App)

app.use(router)

app.use(createPinia())

app.component('SvgIcon', SvgIcon)

app.mount('#app')
