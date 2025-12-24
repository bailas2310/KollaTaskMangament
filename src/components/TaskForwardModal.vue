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
          v-if="visible && task"
          class="bg-white rounded-card shadow-card w-full max-w-lg transition-smooth"
          @click.stop
        >
          <!-- Header -->
          <div class="border-b border-neutral-100 p-6">
            <div class="flex justify-between items-center mb-2">
              <h2 class="text-2xl font-bold text-neutral-900">Forward Task</h2>
              <button
                @click="$emit('close')"
                class="p-2 text-neutral-400 hover:text-neutral-600 rounded-button hover:bg-neutral-100 transition-smooth"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p class="text-sm text-neutral-500">Transfer this task to another user</p>
          </div>

          <!-- Form -->
          <form @submit.prevent="handleSubmit" class="p-6 space-y-6">
            <!-- Task Info -->
            <div class="p-4 bg-neutral-50 rounded-button">
              <h3 class="text-sm font-semibold text-neutral-900 mb-1">{{ task.title }}</h3>
              <p class="text-xs text-neutral-600">{{ task.description }}</p>
            </div>

            <!-- Select Recipient -->
            <div>
              <label for="recipient" class="block text-sm font-medium text-neutral-900 mb-2">
                Forward To <span class="text-danger">*</span>
              </label>
              <div class="relative">
                <input
                  id="recipientSearch"
                  v-model="recipientSearch"
                  type="text"
                  placeholder="Search users..."
                  class="w-full px-4 py-2 border border-neutral-200 rounded-button focus:ring-2 focus:ring-primary-start focus:border-transparent outline-none"
                  @input="filterUsers"
                />
                <svg
                  class="absolute right-3 top-2.5 w-5 h-5 text-neutral-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <select
                id="recipient"
                v-model="selectedRecipientId"
                required
                class="w-full mt-2 px-4 py-2 border border-neutral-200 rounded-button focus:ring-2 focus:ring-primary-start focus:border-transparent outline-none"
              >
                <option value="">Select a user...</option>
                <option
                  v-for="user in filteredUsers"
                  :key="user.id"
                  :value="user.id"
                >
                  {{ user.name }} ({{ user.email }}) - {{ user.role === 'manager' ? 'Manager' : 'Worker' }}
                </option>
              </select>
              <p v-if="errors.recipient" class="mt-1 text-xs text-danger">{{ errors.recipient }}</p>
            </div>

            <!-- Forwarding Note -->
            <div>
              <label for="forwardingNote" class="block text-sm font-medium text-neutral-900 mb-2">
                Forwarding Note (Optional)
              </label>
              <textarea
                id="forwardingNote"
                v-model="forwardingNote"
                rows="3"
                class="w-full px-4 py-2 border border-neutral-200 rounded-button focus:ring-2 focus:ring-primary-start focus:border-transparent outline-none resize-none"
                placeholder="Add a note explaining why you're forwarding this task..."
              ></textarea>
            </div>

            <!-- Warning -->
            <div class="p-3 bg-warning/10 border border-warning/20 rounded-button">
              <div class="flex gap-2">
                <svg class="w-5 h-5 text-warning flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                  <p class="text-sm font-medium text-warning">Task Ownership Transfer</p>
                  <p class="text-xs text-neutral-600 mt-1">
                    This task will be transferred to the selected user. You will no longer be responsible for this task, but you can still view it in your "Forwarded Tasks" section.
                  </p>
                </div>
              </div>
            </div>

            <!-- Error message -->
            <div v-if="error" class="p-3 bg-danger/10 border border-danger/20 rounded-button text-sm text-danger">
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
                :disabled="loading || !selectedRecipientId"
                class="flex-1 px-4 py-2 bg-gradient-primary text-white rounded-button hover:shadow-card disabled:opacity-50 disabled:cursor-not-allowed transition-smooth font-medium"
              >
                {{ loading ? 'Forwarding...' : 'Forward Task' }}
              </button>
            </div>
          </form>
        </div>
      </Transition>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import type { Task } from '../models/Task'
import { useUserStore } from '../store/users'
import { useAuthStore } from '../store/auth'

interface Props {
  task: Task | null
  visible: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  forward: [taskId: string, recipientId: string, forwardingNote?: string]
}>()

const userStore = useUserStore()
const authStore = useAuthStore()
const loading = ref(false)
const error = ref('')
const recipientSearch = ref('')
const selectedRecipientId = ref('')
const forwardingNote = ref('')

const errors = ref({
  recipient: ''
})

const filteredUsers = computed(() => {
  if (!userStore.users.length) return []
  
  const search = recipientSearch.value.toLowerCase()
  return userStore.users.filter(user => {
    // Don't show current user
    if (user.id === authStore.user?.id) return false
    // Don't show if task is already assigned to this user
    if (user.id === props.task?.assignedTo) return false
    // Filter by search
    if (search) {
      return (
        user.name.toLowerCase().includes(search) ||
        user.email.toLowerCase().includes(search)
      )
    }
    return true
  })
})

watch(() => props.visible, (visible) => {
  if (visible) {
    recipientSearch.value = ''
    selectedRecipientId.value = ''
    forwardingNote.value = ''
    error.value = ''
    errors.value = { recipient: '' }
    
    // Load users if not loaded
    if (userStore.users.length === 0) {
      userStore.loadUsers()
    }
  }
})

function filterUsers() {
  // Filtering is handled by computed property
}

function validateForm(): boolean {
  errors.value = { recipient: '' }
  let valid = true

  if (!selectedRecipientId.value) {
    errors.value.recipient = 'Please select a recipient'
    valid = false
  }

  return valid
}

async function handleSubmit() {
  if (!props.task || !validateForm()) return

  loading.value = true
  error.value = ''

  try {
    emit('forward', props.task.id, selectedRecipientId.value, forwardingNote.value || undefined)
    emit('close')
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to forward task'
  } finally {
    loading.value = false
  }
}
</script>

