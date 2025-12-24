import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../store/auth'
import LoginView from '../views/LoginView.vue'
import TasksView from '../views/TasksView.vue'
import UsersView from '../views/UsersView.vue'

// Get base path from Vite config (matches vite.config.ts)
const base = import.meta.env.BASE_URL || '/'

export const router = createRouter({
  history: createWebHistory(base),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: LoginView
    },
    {
      path: '/tasks',
      name: 'tasks',
      component: TasksView,
      meta: { requiresAuth: true }
    },
    {
      path: '/users',
      name: 'users',
      component: UsersView,
      meta: { requiresAuth: true, requiresManager: true }
    },
    {
      path: '/',
      redirect: '/login'
    }
  ]
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  // Restore session if not already loaded
  if (!authStore.isAuthenticated) {
    authStore.restoreSession()
  }

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'login' })
  } else if (to.meta.requiresManager && !authStore.isManager) {
    // Redirect non-managers away from manager-only routes
    next({ name: 'tasks' })
  } else if (to.name === 'login' && authStore.isAuthenticated) {
    next({ name: 'tasks' })
  } else {
    next()
  }
})
