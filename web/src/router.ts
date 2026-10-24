import { createRouter, createWebHistory } from 'vue-router'
import { findTool } from '@/lib/tools'
import HomeView from '@/views/HomeView.vue'
import ToolView from '@/views/ToolView.vue'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: HomeView },
    {
      path: '/:tool',
      component: ToolView,
      // Unknown or not-yet-available tools go back to the home page.
      beforeEnter: (to) => (findTool(String(to.params.tool)) ? true : '/'),
      props: (route) => ({ tool: findTool(String(route.params.tool)) }),
    },
  ],
  scrollBehavior: () => ({ top: 0 }),
})
