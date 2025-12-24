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
          class="bg-white rounded-card shadow-card w-full max-w-2xl max-h-[90vh] overflow-y-auto transition-smooth"
          @click.stop
        >
          <!-- Header -->
          <div class="sticky top-0 bg-white border-b border-neutral-100 p-6">
            <div class="flex justify-between items-center">
              <h2 class="text-2xl font-bold text-neutral-900">Admin Settings</h2>
              <button
                @click="$emit('close')"
                class="p-2 text-neutral-400 hover:text-neutral-600 rounded-button hover:bg-neutral-100 transition-smooth"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p class="text-sm text-neutral-500 mt-2">Configure user permissions and system settings</p>
          </div>

          <!-- Form -->
          <form @submit.prevent="handleSubmit" class="p-6 space-y-6">
            <!-- Priority Change Settings -->
            <div class="border-b border-neutral-100 pb-6">
              <h3 class="text-lg font-semibold text-neutral-900 mb-4">Priority Management</h3>
              
              <div class="space-y-4">
                <!-- Allow Users to Change Priority -->
                <div class="flex items-start justify-between gap-4">
                  <div class="flex-1">
                    <label class="block text-sm font-medium text-neutral-900 mb-1">
                      Allow Users to Change Priority
                    </label>
                    <p class="text-xs text-neutral-500">
                      When enabled, users can change the priority of their assigned tasks. Priority changes will trigger notifications to administrators.
                    </p>
                  </div>
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input
                      v-model="formData.allowUsersPriorityChange"
                      type="checkbox"
                      class="sr-only peer"
                    />
                    <div class="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-start/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-start"></div>
                  </label>
                </div>

                <!-- Require Approval for Priority Change -->
                <div class="flex items-start justify-between gap-4">
                  <div class="flex-1">
                    <label class="block text-sm font-medium text-neutral-900 mb-1">
                      Require Approval for Priority Changes
                    </label>
                    <p class="text-xs text-neutral-500">
                      When enabled, priority changes by users require administrator approval before taking effect.
                    </p>
                  </div>
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input
                      v-model="formData.requireApprovalForPriorityChange"
                      type="checkbox"
                      :disabled="!formData.allowUsersPriorityChange"
                      class="sr-only peer"
                    />
                    <div class="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-start/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-start peer-disabled:opacity-50 peer-disabled:cursor-not-allowed"></div>
                  </label>
                </div>
              </div>
            </div>

            <!-- Task Forwarding Settings -->
            <div class="border-b border-neutral-100 pb-6">
              <h3 class="text-lg font-semibold text-neutral-900 mb-4">Task Management</h3>
              
              <div class="space-y-4">
                <!-- Allow Users to Forward Tasks -->
                <div class="flex items-start justify-between gap-4">
                  <div class="flex-1">
                    <label class="block text-sm font-medium text-neutral-900 mb-1">
                      Allow Users to Forward Tasks
                    </label>
                    <p class="text-xs text-neutral-500">
                      When enabled, users can forward their assigned tasks to other users.
                    </p>
                  </div>
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input
                      v-model="formData.allowUsersTaskForwarding"
                      type="checkbox"
                      class="sr-only peer"
                    />
                    <div class="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-start/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-start"></div>
                  </label>
                </div>
              </div>
            </div>

            <!-- Error message -->
            <div v-if="error" class="p-3 bg-danger/10 border border-danger/20 rounded-button text-sm text-danger">
              {{ error }}
            </div>

            <!-- Success message -->
            <div v-if="success" class="p-3 bg-success/10 border border-success/20 rounded-button text-sm text-success">
              Settings saved successfully!
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
                {{ loading ? 'Saving...' : 'Save Settings' }}
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
import { useAdminSettingsStore } from '../store/adminSettings'

interface Props {
  visible: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
}>()

const adminSettingsStore = useAdminSettingsStore()
const loading = ref(false)
const error = ref('')
const success = ref(false)

const formData = ref({
  allowUsersPriorityChange: false,
  allowUsersTaskForwarding: false,
  requireApprovalForPriorityChange: true
})

watch(() => props.visible, (visible) => {
  if (visible) {
    // Load current settings
    formData.value = {
      allowUsersPriorityChange: adminSettingsStore.settings.allowUsersPriorityChange,
      allowUsersTaskForwarding: adminSettingsStore.settings.allowUsersTaskForwarding,
      requireApprovalForPriorityChange: adminSettingsStore.settings.requireApprovalForPriorityChange
    }
    error.value = ''
    success.value = false
  }
})

async function handleSubmit() {
  loading.value = true
  error.value = ''
  success.value = false

  try {
    await adminSettingsStore.updateSettings(formData.value)
    success.value = true
    setTimeout(() => {
      emit('close')
    }, 1500)
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to save settings'
  } finally {
    loading.value = false
  }
}
</script>

