import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from '../models/User'
import { getAuthService } from '../api/ServiceFactory'
import { useAuthStore } from './auth'
import { MockUserRepository } from '../api/MockUserRepository'
import { API_CONFIG } from '../api/config'

export const useUserStore = defineStore('users', () => {
  const users = ref<User[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const authStore = useAuthStore()

  const workers = computed(() => 
    users.value.filter(u => u.role === 'worker')
  )

  const managers = computed(() => 
    users.value.filter(u => u.role === 'manager')
  )

  async function loadUsers() {
    if (!authStore.user) return

    loading.value = true
    error.value = null
    try {
      let userRepository
      if (API_CONFIG.useMock) {
        // In mock mode, create a new repository instance to access users
        userRepository = new MockUserRepository()
      } else {
        // In real API mode, we'd use UserApiService
        // For now, fallback to mock
        userRepository = new MockUserRepository()
      }
      
      users.value = await userRepository.findAll(authStore.user.tenantId)
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to load users'
      // Fallback to mock data on error
      const mockRepo = new MockUserRepository()
      users.value = await mockRepo.findAll(authStore.user.tenantId)
    } finally {
      loading.value = false
    }
  }

  async function createUser(user: Omit<User, 'id'>): Promise<User> {
    if (!authStore.user) throw new Error('Not authenticated')

    loading.value = true
    error.value = null
    try {
      let userRepository
      if (API_CONFIG.useMock) {
        userRepository = new MockUserRepository()
      } else {
        // In real API mode, we'd use UserApiService
        userRepository = new MockUserRepository()
      }
      
      const newUser: User = {
        ...user,
        id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        tenantId: authStore.user.tenantId
      }
      
      const savedUser = await userRepository.save(newUser)
      // Update local store
      const index = users.value.findIndex(u => u.id === savedUser.id)
      if (index >= 0) {
        users.value[index] = savedUser
      } else {
        users.value.push(savedUser)
      }
      return savedUser
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to create user'
      throw e
    } finally {
      loading.value = false
    }
  }

  function getUserById(id: string): User | null {
    return users.value.find(u => u.id === id) || null
  }

  return {
    users,
    workers,
    managers,
    loading,
    error,
    loadUsers,
    createUser,
    getUserById
  }
})

