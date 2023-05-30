import { createApp } from 'vue'

import { createPinia } from 'pinia'
import Markdown from 'vue3-markdown-it'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import { processReleaseRouter } from './utils/index'
import router from './router'
import App from '@/App.vue'

import 'normalize.css'

const app = createApp(App)

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)
processReleaseRouter()
app.use(pinia)

app.use(router)
app.use(Markdown)
app.mount('#app')
