import { createRouter, createWebHistory } from 'vue-router'
import MapPage from './pages/MapPage.jsx'
import CommunityPage from './pages/CommunityPage.jsx'

export default createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/map' },
    { path: '/map', name: 'map', component: MapPage },
    { path: '/community', name: 'community', component: CommunityPage }
  ]
})
