import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from '../models/User'
import { getAuthService } from '../api/ServiceFactory'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const loading = ref(false)

  const isAuthenticated = computed(() => user.value !== null)
  const isManager = computed(() => user.value?.role === 'manager')
  const isWorker = computed(() => user.value?.role === 'worker')

  async function login(email: string, password: string, role: 'worker' | 'manager') {
    loading.value = true
    try {
      const authService = getAuthService()
      const loggedInUser = await authService.login(email, password, role)
      if (loggedInUser) {
        user.value = loggedInUser
        localStorage.setItem('kolla_user', JSON.stringify(loggedInUser))
        // Token is already stored by AuthApiService if using real API
        return true
      }
      return false
    } finally {
      loading.value = false
    }
  }

  async function register(
    email: string,
    password: string,
    name: string,
    role: 'worker' | 'manager',
    tenantId: string = 'tenant-1'
  ) {
    loading.value = true
    try {
      const authService = getAuthService()
      const registeredUser = await authService.register(email, password, name, role, tenantId)
      if (registeredUser) {
        user.value = registeredUser
        localStorage.setItem('kolla_user', JSON.stringify(registeredUser))
        return true
      }
      return false
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    const authService = getAuthService()
    await authService.logout()
    user.value = null
    localStorage.removeItem('kolla_user')
  }

  function restoreSession() {
    const stored = localStorage.getItem('kolla_user')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        // Convert dates if needed
        user.value = parsed
      } catch (e) {
        localStorage.removeItem('kolla_user')
      }
    }
  }

  return {
    user,
    loading,
    isAuthenticated,
    isManager,
    isWorker,
    login,
    register,
    logout,
    restoreSession
  }
})

