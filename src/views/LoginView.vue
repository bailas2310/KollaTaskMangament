<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-primary p-4">
    <div class="bg-white rounded-card shadow-card w-full max-w-md p-6 sm:p-8 transition-smooth">
      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold text-gradient-primary mb-2">Kolla</h1>
        <p class="text-neutral-500 text-sm">Task Management System</p>
      </div>

      <div v-if="error" class="mb-4 p-3 bg-red-50 border border-red-200 text-danger rounded-button text-sm">
        {{ error }}
      </div>

      <!-- Login Form -->
      <form @submit.prevent="handleLogin" class="space-y-6">
        <div>
          <label class="block text-sm font-medium text-neutral-900 mb-2">
            Email
          </label>
          <input
            v-model="email"
            type="email"
            required
            class="w-full px-4 py-3 border border-neutral-100 rounded-button focus:ring-2 focus:ring-primary-start focus:border-transparent transition-smooth outline-none"
            placeholder="Enter your email address"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-neutral-900 mb-2">
            Password
          </label>
          <input
            v-model="loginPassword"
            type="password"
            required
            class="w-full px-4 py-3 border border-neutral-100 rounded-button focus:ring-2 focus:ring-primary-start focus:border-transparent transition-smooth outline-none"
            placeholder="Enter your password"
          />
        </div>

        <button
          type="submit"
          :disabled="loading"
          class="w-full bg-gradient-primary text-white py-3 rounded-button font-semibold hover:shadow-card disabled:opacity-50 disabled:cursor-not-allowed transition-smooth"
        >
          {{ loading ? 'Logging in...' : 'Login' }}
        </button>
      </form>

      <div class="mt-6 text-xs text-neutral-500 text-center space-y-1">
        <p class="font-medium">Demo credentials:</p>
        <p>Admin: Bailasan@gmail.com (Manager role)</p>
        <p>Workers: ronaldo@gmail.com, moh@gmail.com, Merveilles@gmail.com, hanif@gmail.com, bosco@gmail.com</p>
        <p class="mt-2 text-neutral-400">Password: password123</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../store/auth'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const loginPassword = ref('')
const loading = ref(false)
const error = ref('')

async function handleLogin() {
  loading.value = true
  error.value = ''
  
  try {
    const success = await authStore.login(email.value, loginPassword.value)
    if (success) {
      // Navigate based on user role
      if (authStore.isManager) {
        // Managers can access both tasks and users, default to tasks
        router.push('/tasks')
      } else {
        // Workers go to tasks view
        router.push('/tasks')
      }
    } else {
      error.value = 'Invalid credentials. Please check your email and password.'
    }
  } catch (e) {
    error.value = 'Login failed. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>
