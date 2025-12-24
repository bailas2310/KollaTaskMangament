<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-primary p-4">
    <div class="bg-white rounded-card shadow-card w-full max-w-md p-6 sm:p-8 transition-smooth">
      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold text-gradient-primary mb-2">Kolla</h1>
        <p class="text-neutral-500 text-sm">Task Management System</p>
      </div>

      <!-- Toggle between Login and Register -->
      <div class="flex gap-2 mb-6 p-1 bg-neutral-100 rounded-button">
        <button
          @click="isLogin = true"
          :class="[
            'flex-1 px-4 py-2 rounded-button text-sm font-medium transition-smooth',
            isLogin
              ? 'bg-gradient-primary text-white shadow-soft'
              : 'text-neutral-600 hover:text-neutral-900'
          ]"
        >
          Login
        </button>
        <button
          @click="isLogin = false"
          :class="[
            'flex-1 px-4 py-2 rounded-button text-sm font-medium transition-smooth',
            !isLogin
              ? 'bg-gradient-primary text-white shadow-soft'
              : 'text-neutral-600 hover:text-neutral-900'
          ]"
        >
          Register
        </button>
      </div>

      <div v-if="error" class="mb-4 p-3 bg-red-50 border border-red-200 text-danger rounded-button text-sm">
        {{ error }}
      </div>

      <!-- Login Form -->
      <form v-if="isLogin" @submit.prevent="handleLogin" class="space-y-6">
        <div>
          <label class="block text-sm font-medium text-neutral-900 mb-2">
            Email
          </label>
          <input
            v-model="email"
            type="email"
            required
            class="w-full px-4 py-3 border border-neutral-100 rounded-button focus:ring-2 focus:ring-primary-start focus:border-transparent transition-smooth outline-none"
            placeholder="Bailasan@gmail.com (admin) or any worker email"
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

        <div>
          <label class="block text-sm font-medium text-neutral-900 mb-2">
            Role
          </label>
          <div class="grid grid-cols-2 gap-3">
            <button
              type="button"
              @click="role = 'worker'"
              :class="[
                'px-4 py-3 rounded-button border-2 transition-smooth font-medium',
                role === 'worker'
                  ? 'border-primary-start bg-gradient-primary text-white shadow-soft'
                  : 'border-neutral-100 bg-white text-neutral-900 hover:border-primary-start hover:shadow-soft'
              ]"
            >
              Actor
            </button>
            <button
              type="button"
              @click="role = 'manager'"
              :class="[
                'px-4 py-3 rounded-button border-2 transition-smooth font-medium',
                role === 'manager'
                  ? 'border-primary-start bg-gradient-primary text-white shadow-soft'
                  : 'border-neutral-100 bg-white text-neutral-900 hover:border-primary-start hover:shadow-soft'
              ]"
            >
              Workflow Manager
            </button>
          </div>
        </div>

        <button
          type="submit"
          :disabled="loading"
          class="w-full bg-gradient-primary text-white py-3 rounded-button font-semibold hover:shadow-card disabled:opacity-50 disabled:cursor-not-allowed transition-smooth"
        >
          {{ loading ? 'Logging in...' : 'Login' }}
        </button>
      </form>

      <!-- Register Form -->
      <form v-else @submit.prevent="handleRegister" class="space-y-6">
        <div>
          <label class="block text-sm font-medium text-neutral-900 mb-2">
            Name
          </label>
          <input
            v-model="registerName"
            type="text"
            required
            class="w-full px-4 py-3 border border-neutral-100 rounded-button focus:ring-2 focus:ring-primary-start focus:border-transparent transition-smooth outline-none"
            placeholder="Your name"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-neutral-900 mb-2">
            Email
          </label>
          <input
            v-model="registerEmail"
            type="email"
            required
            class="w-full px-4 py-3 border border-neutral-100 rounded-button focus:ring-2 focus:ring-primary-start focus:border-transparent transition-smooth outline-none"
            placeholder="your.email@example.com"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-neutral-900 mb-2">
            Password
          </label>
          <input
            v-model="password"
            type="password"
            required
            minlength="6"
            class="w-full px-4 py-3 border border-neutral-100 rounded-button focus:ring-2 focus:ring-primary-start focus:border-transparent transition-smooth outline-none"
            placeholder="Minimum 6 characters"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-neutral-900 mb-2">
            Role
          </label>
          <div class="grid grid-cols-2 gap-3">
            <button
              type="button"
              @click="registerRole = 'worker'"
              :class="[
                'px-4 py-3 rounded-button border-2 transition-smooth font-medium',
                registerRole === 'worker'
                  ? 'border-primary-start bg-gradient-primary text-white shadow-soft'
                  : 'border-neutral-100 bg-white text-neutral-900 hover:border-primary-start hover:shadow-soft'
              ]"
            >
              Actor
            </button>
            <button
              type="button"
              @click="registerRole = 'manager'"
              :class="[
                'px-4 py-3 rounded-button border-2 transition-smooth font-medium',
                registerRole === 'manager'
                  ? 'border-primary-start bg-gradient-primary text-white shadow-soft'
                  : 'border-neutral-100 bg-white text-neutral-900 hover:border-primary-start hover:shadow-soft'
              ]"
            >
              Workflow Manager
            </button>
          </div>
        </div>

        <button
          type="submit"
          :disabled="loading"
          class="w-full bg-gradient-primary text-white py-3 rounded-button font-semibold hover:shadow-card disabled:opacity-50 disabled:cursor-not-allowed transition-smooth"
        >
          {{ loading ? 'Registering...' : 'Register' }}
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

const isLogin = ref(true)
const email = ref('')
const loginPassword = ref('')
const role = ref<'worker' | 'manager'>('worker')
const registerName = ref('')
const registerEmail = ref('')
const password = ref('')
const registerRole = ref<'worker' | 'manager'>('worker')
const loading = ref(false)
const error = ref('')

async function handleLogin() {
  loading.value = true
  error.value = ''
  
  try {
    const success = await authStore.login(email.value, loginPassword.value, role.value)
    if (success) {
      router.push('/tasks')
    } else {
      error.value = 'Invalid credentials. Please check your email, password, and role.'
    }
  } catch (e) {
    error.value = 'Login failed. Please try again.'
  } finally {
    loading.value = false
  }
}

async function handleRegister() {
  loading.value = true
  error.value = ''
  
  try {
    const success = await authStore.register(
      registerEmail.value,
      password.value,
      registerName.value,
      registerRole.value,
      'tenant-1'
    )
    if (success) {
      router.push('/tasks')
    } else {
      error.value = 'Registration failed. Email may already be in use or registration is not available in demo mode.'
    }
  } catch (e) {
    error.value = 'Registration failed. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>
