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
          class="bg-white rounded-card shadow-card w-full max-w-2xl max-h-[90vh] overflow-y-auto transition-smooth"
          @click.stop
        >
          <!-- Header -->
          <div class="sticky top-0 bg-white border-b border-neutral-100 p-6">
            <div class="flex justify-between items-center mb-4">
              <h2 class="text-2xl font-bold text-neutral-900">Edit Task</h2>
              <button
                @click="$emit('close')"
                class="p-2 text-neutral-400 hover:text-neutral-600 rounded-button hover:bg-neutral-100 transition-smooth"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p class="text-sm text-neutral-500">Editing: {{ task.title }}</p>
          </div>

          <!-- Form -->
          <form @submit.prevent="handleSubmit" class="p-6 space-y-6">
            <!-- Description -->
            <div>
              <label for="description" class="block text-sm font-medium text-neutral-900 mb-2">
                Description <span class="text-danger">*</span>
              </label>
              <textarea
                id="description"
                v-model="formData.description"
                rows="4"
                required
                class="w-full px-4 py-2 border border-neutral-200 rounded-button focus:ring-2 focus:ring-primary-start focus:border-transparent outline-none resize-none"
                placeholder="Enter task description..."
              ></textarea>
              <p v-if="errors.description" class="mt-1 text-xs text-danger">{{ errors.description }}</p>
            </div>

            <!-- Notes/Comments -->
            <div>
              <label for="notes" class="block text-sm font-medium text-neutral-900 mb-2">
                Notes/Comments
              </label>
              <textarea
                id="notes"
                v-model="formData.notes"
                rows="3"
                class="w-full px-4 py-2 border border-neutral-200 rounded-button focus:ring-2 focus:ring-primary-start focus:border-transparent outline-none resize-none"
                placeholder="Add your notes or comments..."
              ></textarea>
            </div>

            <!-- Due Date -->
            <div>
              <label for="deadline" class="block text-sm font-medium text-neutral-900 mb-2">
                Due Date <span class="text-danger">*</span>
              </label>
              <input
                id="deadline"
                v-model="formData.deadline"
                type="datetime-local"
                required
                class="w-full px-4 py-2 border border-neutral-200 rounded-button focus:ring-2 focus:ring-primary-start focus:border-transparent outline-none"
              />
              <p v-if="errors.deadline" class="mt-1 text-xs text-danger">{{ errors.deadline }}</p>
            </div>

            <!-- Status -->
            <div>
              <label for="status" class="block text-sm font-medium text-neutral-900 mb-2">
                Status <span class="text-danger">*</span>
              </label>
              <select
                id="status"
                v-model="formData.status"
                required
                class="w-full px-4 py-2 border border-neutral-200 rounded-button focus:ring-2 focus:ring-primary-start focus:border-transparent outline-none"
              >
                <option value="pending">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <!-- Priority (only if admin allows) -->
            <div v-if="canChangePriority">
              <label for="priority" class="block text-sm font-medium text-neutral-900 mb-2">
                Priority
              </label>
              <select
                id="priority"
                v-model="formData.priority"
                class="w-full px-4 py-2 border border-neutral-200 rounded-button focus:ring-2 focus:ring-primary-start focus:border-transparent outline-none"
              >
                <option value="immediate">High (Immediate - ≤8h)</option>
                <option value="medium">Medium (8-32h)</option>
                <option value="long">Low (Long-term - >32h)</option>
              </select>
              <p class="mt-1 text-xs text-neutral-500">
                Priority changes will be notified to administrators
              </p>
            </div>
            <div v-else class="p-3 bg-neutral-50 rounded-button">
              <p class="text-sm text-neutral-600">
                <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Priority changes are restricted. Contact an administrator to change priority.
              </p>
            </div>

            <!-- Tags -->
            <div>
              <label for="tags" class="block text-sm font-medium text-neutral-900 mb-2">
                Tags/Labels
              </label>
              <div class="flex flex-wrap gap-2 mb-2">
                <span
                  v-for="(tag, index) in formData.tags"
                  :key="index"
                  class="inline-flex items-center gap-1 px-3 py-1 bg-primary-start/10 text-primary-start rounded-button text-sm"
                >
                  {{ tag }}
                  <button
                    type="button"
                    @click="removeTag(index)"
                    class="hover:text-primary-end"
                  >
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              </div>
              <div class="flex gap-2">
                <input
                  id="newTag"
                  v-model="newTagInput"
                  type="text"
                  @keyup.enter="addTag"
                  class="flex-1 px-4 py-2 border border-neutral-200 rounded-button focus:ring-2 focus:ring-primary-start focus:border-transparent outline-none"
                  placeholder="Add a tag and press Enter"
                />
                <button
                  type="button"
                  @click="addTag"
                  class="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 rounded-button transition-smooth"
                >
                  Add
                </button>
              </div>
            </div>

            <!-- Attachments -->
            <div>
              <label class="block text-sm font-medium text-neutral-900 mb-2">
                Attachments
              </label>
              <div v-if="formData.attachments.length > 0" class="mb-2 space-y-2">
                <div
                  v-for="(attachment, index) in formData.attachments"
                  :key="index"
                  class="flex items-center justify-between p-2 bg-neutral-50 rounded-button"
                >
                  <span class="text-sm text-neutral-700">{{ attachment }}</span>
                  <button
                    type="button"
                    @click="removeAttachment(index)"
                    class="text-danger hover:text-danger/80"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              <div class="flex gap-2">
                <input
                  ref="fileInput"
                  type="file"
                  @change="handleFileSelect"
                  class="hidden"
                  multiple
                />
                <button
                  type="button"
                  @click="fileInput?.click()"
                  class="px-4 py-2 border border-neutral-200 rounded-button hover:bg-neutral-50 transition-smooth text-sm"
                >
                  Choose Files
                </button>
                <span class="text-xs text-neutral-500 self-center">or drag and drop files here</span>
              </div>
            </div>

            <!-- Auto-save indicator -->
            <div v-if="hasChanges && autoSaveEnabled" class="flex items-center gap-2 text-sm text-neutral-500">
              <svg class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Auto-saving...</span>
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
                :disabled="loading || !hasChanges"
                class="flex-1 px-4 py-2 bg-gradient-primary text-white rounded-button hover:shadow-card disabled:opacity-50 disabled:cursor-not-allowed transition-smooth font-medium"
              >
                {{ loading ? 'Saving...' : 'Save Changes' }}
              </button>
            </div>
          </form>
        </div>
      </Transition>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import type { Task, TaskStatus, TaskPriority } from '../models/Task'
import { useAuthStore } from '../store/auth'
import { useAdminSettingsStore } from '../store/adminSettings'

interface Props {
  task: Task | null
  visible: boolean
  autoSaveEnabled?: boolean
  allowDueDateEdit?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  autoSaveEnabled: false,
  allowDueDateEdit: true
})

const emit = defineEmits<{
  close: []
  save: [task: Task]
}>()

const authStore = useAuthStore()
const adminSettingsStore = useAdminSettingsStore()
const loading = ref(false)
const error = ref('')
const fileInput = ref<HTMLInputElement | null>(null)
const newTagInput = ref('')
const autoSaveTimer = ref<number | null>(null)

const canChangePriority = computed(() => {
  // Managers can always change priority
  if (authStore.isManager) return true
  // Regular users can only if admin allows
  return adminSettingsStore.canUsersChangePriority
})

const formData = ref({
  description: '',
  notes: '',
  deadline: '',
  status: 'pending' as TaskStatus,
  priority: 'medium' as TaskPriority,
  tags: [] as string[],
  attachments: [] as string[]
})

const errors = ref({
  description: '',
  deadline: ''
})

const hasChanges = computed(() => {
  if (!props.task) return false
  return (
    formData.value.description !== props.task.description ||
    formData.value.notes !== (props.task.notes || '') ||
    formData.value.deadline !== formatDateTimeLocal(props.task.deadline) ||
    formData.value.status !== props.task.status ||
    JSON.stringify(formData.value.tags) !== JSON.stringify(props.task.tags || []) ||
    JSON.stringify(formData.value.attachments) !== JSON.stringify(props.task.attachments || [])
  )
})

watch(() => props.task, (task) => {
  if (task) {
    formData.value = {
      description: task.description,
      notes: task.notes || '',
      deadline: formatDateTimeLocal(task.deadline),
      status: task.status,
      priority: task.priority,
      tags: [...(task.tags || [])],
      attachments: [...(task.attachments || [])]
    }
    error.value = ''
  }
}, { immediate: true })

watch(() => props.visible, (visible) => {
  if (!visible) {
    error.value = ''
    if (autoSaveTimer.value) {
      clearTimeout(autoSaveTimer.value)
      autoSaveTimer.value = null
    }
  }
})

// Auto-save functionality
watch(() => formData.value, () => {
  if (props.autoSaveEnabled && props.visible && hasChanges.value) {
    if (autoSaveTimer.value) {
      clearTimeout(autoSaveTimer.value)
    }
    autoSaveTimer.value = window.setTimeout(() => {
      handleSubmit(true) // silent save
    }, 2000) // Auto-save after 2 seconds of inactivity
  }
}, { deep: true })

onUnmounted(() => {
  if (autoSaveTimer.value) {
    clearTimeout(autoSaveTimer.value)
  }
})

function formatDateTimeLocal(date: Date | string): string {
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

function validateForm(): boolean {
  errors.value = { description: '', deadline: '' }
  let valid = true

  if (!formData.value.description.trim()) {
    errors.value.description = 'Description is required'
    valid = false
  }

  if (!formData.value.deadline) {
    errors.value.deadline = 'Due date is required'
    valid = false
  } else {
    const deadline = new Date(formData.value.deadline)
    if (isNaN(deadline.getTime())) {
      errors.value.deadline = 'Invalid date'
      valid = false
    }
  }

  return valid
}

function addTag() {
  const tag = newTagInput.value.trim()
  if (tag && !formData.value.tags.includes(tag)) {
    formData.value.tags.push(tag)
    newTagInput.value = ''
  }
}

function removeTag(index: number) {
  formData.value.tags.splice(index, 1)
}

function handleFileSelect(event: Event) {
  const target = event.target as HTMLInputElement
  if (target.files) {
    Array.from(target.files).forEach(file => {
      // In a real app, you would upload the file and get a URL
      // For now, we'll just store the filename
      const fileName = file.name
      if (!formData.value.attachments.includes(fileName)) {
        formData.value.attachments.push(fileName)
      }
    })
  }
  // Reset input
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

function removeAttachment(index: number) {
  formData.value.attachments.splice(index, 1)
}

async function handleSubmit(event?: Event | boolean) {
  const silent = typeof event === 'boolean' ? event : false
  if (event && typeof event !== 'boolean') {
    event.preventDefault()
  }
  if (!props.task || !authStore.user) return

  if (!silent && !validateForm()) {
    return
  }

  loading.value = true
  error.value = ''

  try {
    // Detect changes for edit history
    const changes: { field: string; oldValue: any; newValue: any }[] = []
    
    if (props.task.description !== formData.value.description) {
      changes.push({
        field: 'description',
        oldValue: props.task.description,
        newValue: formData.value.description
      })
    }
    
    if ((props.task.notes || '') !== formData.value.notes) {
      changes.push({
        field: 'notes',
        oldValue: props.task.notes || '',
        newValue: formData.value.notes
      })
    }
    
    if (new Date(props.task.deadline).getTime() !== new Date(formData.value.deadline).getTime()) {
      changes.push({
        field: 'deadline',
        oldValue: props.task.deadline,
        newValue: new Date(formData.value.deadline)
      })
    }
    
    if (props.task.status !== formData.value.status) {
      changes.push({
        field: 'status',
        oldValue: props.task.status,
        newValue: formData.value.status
      })
    }
    
    if (JSON.stringify(props.task.tags || []) !== JSON.stringify(formData.value.tags)) {
      changes.push({
        field: 'tags',
        oldValue: props.task.tags || [],
        newValue: formData.value.tags
      })
    }
    
    if (JSON.stringify(props.task.attachments || []) !== JSON.stringify(formData.value.attachments)) {
      changes.push({
        field: 'attachments',
        oldValue: props.task.attachments || [],
        newValue: formData.value.attachments
      })
    }

    const updatedTask: Task = {
      ...props.task,
      description: formData.value.description,
      notes: formData.value.notes,
      deadline: new Date(formData.value.deadline),
      status: formData.value.status,
      priority: formData.value.priority,
      tags: formData.value.tags,
      attachments: formData.value.attachments,
      updatedAt: new Date(),
      lastEditedBy: authStore.user.id,
      lastEditedByName: authStore.user.name,
      lastEditedAt: new Date(),
      editHistory: [
        ...(props.task.editHistory || []),
        {
          id: `edit-${Date.now()}`,
          taskId: props.task.id,
          editedBy: authStore.user.id,
          editedByName: authStore.user.name,
          editedAt: new Date(),
          changes
        }
      ]
    }

    emit('save', updatedTask)
    
    if (!silent) {
      emit('close')
    }
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to save task'
  } finally {
    loading.value = false
  }
}
</script>

