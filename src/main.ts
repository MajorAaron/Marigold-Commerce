import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import './style.css'
import App from './App.vue'
import { signalsService } from './services/signals'

const app = createApp(App)
const pinia = createPinia()

// Initialize Signals SDK
// Replace 'YOUR_ACCOUNT_ID' with your actual Marigold Signals account ID
signalsService.initialize('5141a5ee-fe6d-4bc2-b5a1-837b49491e38')
  .catch(error => console.error('Failed to initialize Signals:', error))

app.use(pinia)
app.use(router)
app.mount('#app')
