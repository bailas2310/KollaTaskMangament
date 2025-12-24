<template>
  <Transition
    enter-active-class="transition ease-out duration-300"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition ease-in duration-200"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="visible"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 transition-smooth"
      @click="$emit('close')"
    >
      <Transition
        enter-active-class="transition ease-out duration-300"
        enter-from-class="opacity-0 scale-95"
        enter-to-class="opacity-100 scale-100"
        leave-active-class="transition ease-in duration-200"
        leave-from-class="opacity-100 scale-100"
        leave-to-class="opacity-0 scale-95"
      >
        <div
          v-if="visible"
          class="bg-white rounded-card shadow-card w-full max-w-md transition-smooth"
          @click.stop
        >
          <!-- Header -->
          <div class="border-b border-neutral-100 p-6 flex justify-between items-center">
            <h2 class="text-2xl font-bold text-neutral-900">Create New User</h2>
            <button
              @click="$emit('close')"
              class="p-2 text-neutral-400 hover:text-neutral-600 rounded-button hover:bg-neutral-100 transition-smooth"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Form -->
          <form @submit.prevent="handleSubmit" class="p-6 space-y-4">
            <div>
              <label class="block text-sm font-medium text-neutral-900 mb-2">
                Name <span class="text-danger">*</span>
              </label>
              <input
                v-model="formData.name"
                type="text"
                required
                class="w-full px-4 py-3 border border-neutral-100 rounded-button focus:ring-2 focus:ring-primary-start focus:border-transparent transition-smooth outline-none"
                placeholder="Enter user name"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-neutral-900 mb-2">
                Email <span class="text-danger">*</span>
              </label>
              <input
                v-model="formData.email"
                type="email"
                required
                class="w-full px-4 py-3 border border-neutral-100 rounded-button focus:ring-2 focus:ring-primary-start focus:border-transparent transition-smooth outline-none"
                placeholder="user@example.com"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-neutral-900 mb-2">
                Role <span class="text-danger">*</span>
              </label>
              <select
                v-model="formData.role"
                required
                class="w-full px-4 py-3 border border-neutral-100 rounded-button focus:ring-2 focus:ring-primary-start focus:border-transparent transition-smooth outline-none"
              >
                <option value="worker">Actor (Worker)</option>
                <option value="manager">Workflow Manager</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-neutral-900 mb-2">
                Password <span class="text-danger">*</span>
              </label>
              <input
                v-model="formData.password"
                type="password"
                required
                minlength="6"
                class="w-full px-4 py-3 border border-neutral-100 rounded-button focus:ring-2 focus:ring-primary-start focus:border-transparent transition-smooth outline-none"
                placeholder="Minimum 6 characters"
              />
            </div>

            <div v-if="error" class="p-3 bg-red-50 border border-red-200 text-danger rounded-button text-sm">
              {{ error }}
            </div>

            <!-- Actions -->
            <div class="flex gap-3 pt-4 border-t border-neutral-100">
              <button
                type="button"
                @click="$emit('close')"
                class="flex-1 px-4 py-2 border border-neutral-100 rounded-button hover:bg-neutral-50 transition-smooth font-medium text-neutral-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                :disabled="loading"
                class="flex-1 px-4 py-2 bg-gradient-primary text-white rounded-button hover:shadow-card disabled:opacity-50 disabled:cursor-not-allowed transition-smooth font-medium"
              >
                {{ loading ? 'Creating...' : 'Create User' }}
              </button>
            </div>
          </form>
        </div>
      </Transition>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { UserRole } from '../models/Task'
import { useUserStore } from '../store/users'
import { useAuthStore } from '../store/auth'

interface Props {
  visible: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  created: []
}>()

const userStore = useUserStore()
const authStore = useAuthStore()
const loading = ref(false)
const error = ref('')

const formData = ref({
  name: '',
  email: '',
  role: 'worker' as UserRole,
  password: ''
})

watch(() => props.visible, (visible) => {
  if (!visible) {
    resetForm()
    error.value = ''
  }
})

function resetForm() {
  formData.value = {
    name: '',
    email: '',
    role: 'worker',
    password: ''
  }
}

async function handleSubmit() {
  if (!authStore.user) {
    error.value = 'Not authenticated'
    return
  }

  loading.value = true
  error.value = ''

  try {
    // Check if user already exists
    const existingUsers = userStore.users.filter(u => u.email === formData.value.email)
    if (existingUsers.length > 0) {
      error.value = 'A user with this email already exists'
      loading.value = false
      return
    }

    await userStore.createUser({
      name: formData.value.name,
      email: formData.value.email,
      role: formData.value.role,
      tenantId: authStore.user.tenantId
    })

    emit('created')
    emit('close')
    resetForm()
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to create user'
  } finally {
    loading.value = false
  }
}
</script>

