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
          <div class="sticky top-0 bg-white border-b border-neutral-100 p-6 flex justify-between items-center">
            <h2 class="text-2xl font-bold text-neutral-900">
              {{ isEdit ? 'Edit Task' : 'Create New Task' }}
            </h2>
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
          <form @submit.prevent="handleSubmit" class="p-6 space-y-6">
            <div>
              <label class="block text-sm font-medium text-neutral-900 mb-2">
                Title <span class="text-danger">*</span>
              </label>
              <input
                v-model="formData.title"
                type="text"
                required
                class="w-full px-4 py-3 border border-neutral-100 rounded-button focus:ring-2 focus:ring-primary-start focus:border-transparent transition-smooth outline-none"
                placeholder="Enter task title"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-neutral-900 mb-2">
                Description <span class="text-danger">*</span>
              </label>
              <textarea
                v-model="formData.description"
                required
                rows="4"
                class="w-full px-4 py-3 border border-neutral-100 rounded-button focus:ring-2 focus:ring-primary-start focus:border-transparent transition-smooth outline-none resize-none"
                placeholder="Enter task description"
              ></textarea>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-neutral-900 mb-2">
                  Duration (hours) <span class="text-danger">*</span>
                </label>
                <input
                  v-model.number="formData.duration"
                  type="number"
                  required
                  min="1"
                  class="w-full px-4 py-3 border border-neutral-100 rounded-button focus:ring-2 focus:ring-primary-start focus:border-transparent transition-smooth outline-none"
                  placeholder="4"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-neutral-900 mb-2">
                  Deadline <span class="text-danger">*</span>
                </label>
                <input
                  v-model="formData.deadline"
                  type="datetime-local"
                  required
                  class="w-full px-4 py-3 border border-neutral-100 rounded-button focus:ring-2 focus:ring-primary-start focus:border-transparent transition-smooth outline-none"
                />
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  Assign To (Optional)
                </label>
                <select
                  v-model="formData.assignedTo"
                  class="w-full px-4 py-3 border border-neutral-100 rounded-button focus:ring-2 focus:ring-primary-start focus:border-transparent transition-smooth outline-none"
                >
                  <option value="">-- Select User --</option>
                  <option
                    v-for="user in availableUsers"
                    :key="user.id"
                    :value="user.id"
                  >
                    {{ user.name }} ({{ user.email }}) - {{ user.role === 'worker' ? 'Actor' : 'Manager' }}
                  </option>
                </select>
              </div>
            </div>

            <div v-if="isEdit" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-neutral-900 mb-2">
                  Completed Steps
                </label>
                <input
                  v-model.number="formData.completedSteps"
                  type="number"
                  min="0"
                  :max="formData.totalSteps || 0"
                  class="w-full px-4 py-3 border border-neutral-100 rounded-button focus:ring-2 focus:ring-primary-start focus:border-transparent transition-smooth outline-none"
                  placeholder="0"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-neutral-900 mb-2">
                  Total Steps
                </label>
                <input
                  v-model.number="formData.totalSteps"
                  type="number"
                  min="0"
                  class="w-full px-4 py-3 border border-neutral-100 rounded-button focus:ring-2 focus:ring-primary-start focus:border-transparent transition-smooth outline-none"
                  placeholder="0"
                />
              </div>
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
                {{ loading ? 'Saving...' : (isEdit ? 'Update Task' : 'Create Task') }}
              </button>
            </div>
          </form>
        </div>
      </Transition>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, watch, computed, onMounted } from 'vue'
import type { Task, UserRole } from '../models/Task'
import { useUserStore } from '../store/users'

interface Props {
  visible: boolean
  task?: Task | null
  tenantId: string
}

const props = withDefaults(defineProps<Props>(), {
  task: null
})

const emit = defineEmits<{
  close: []
  save: [task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'priority'>]
  update: [task: Task]
}>()

const loading = ref(false)
const error = ref('')
const userStore = useUserStore()

const isEdit = computed(() => !!props.task)

const availableUsers = computed(() => {
  // Filter users based on the selected role for the task
  if (formData.value.role === 'worker') {
    return userStore.workers
  } else {
    return userStore.managers
  }
})

onMounted(async () => {
  if (userStore.users.length === 0) {
    await userStore.loadUsers()
  }
})

const formData = ref({
  title: '',
  description: '',
  duration: 4,
  deadline: '',
  role: 'worker' as UserRole,
  assignedTo: '',
  completedSteps: 0,
  totalSteps: 0
})

watch(() => props.task, (task) => {
  if (task) {
    formData.value = {
      title: task.title,
      description: task.description,
      duration: task.duration,
      deadline: formatDateTimeLocal(task.deadline),
      role: task.role,
      assignedTo: task.assignedTo || '',
      completedSteps: task.completedSteps || 0,
      totalSteps: task.totalSteps || 0
    }
  } else {
    resetForm()
  }
}, { immediate: true })

watch(() => props.visible, (visible) => {
  if (!visible) {
    resetForm()
    error.value = ''
  }
})

function resetForm() {
  formData.value = {
    title: '',
    description: '',
    duration: 4,
    deadline: '',
    role: 'worker',
    assignedTo: '',
    completedSteps: 0,
    totalSteps: 0
  }
}

function formatDateTimeLocal(date: Date | string): string {
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

async function handleSubmit() {
  loading.value = true
  error.value = ''

  try {
    const taskData = {
      title: formData.value.title,
      description: formData.value.description,
      duration: formData.value.duration,
      deadline: new Date(formData.value.deadline),
      role: formData.value.role,
      assignedTo: formData.value.assignedTo || undefined,
      tenantId: props.tenantId,
      status: props.task?.status || 'pending',
      completedSteps: formData.value.completedSteps || undefined,
      totalSteps: formData.value.totalSteps || undefined
    }

    if (isEdit.value && props.task) {
      emit('update', {
        ...props.task,
        ...taskData
      } as Task)
    } else {
      emit('save', taskData)
    }

    emit('close')
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to save task'
  } finally {
    loading.value = false
  }
}
</script>

