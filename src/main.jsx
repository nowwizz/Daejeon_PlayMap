import { createApp } from 'vue'
import App from './App.jsx'
import router from './router.js'
import './style.css'

createApp(App).use(router).mount('#app')
