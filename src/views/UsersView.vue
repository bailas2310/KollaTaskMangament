<template>
  <div class="min-h-screen bg-neutral-50">
    <header class="bg-white shadow-soft border-b border-neutral-100">
      <div class="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 class="text-2xl font-bold text-neutral-900">Users Management</h1>
            <p class="text-sm text-neutral-500 mt-1">View and manage all users</p>
          </div>
          <div class="flex gap-3 items-center">
            <button
              @click="router.push({ name: 'tasks' })"
              class="px-4 py-2 text-sm text-neutral-700 hover:text-neutral-900 border border-neutral-100 rounded-button hover:bg-neutral-50 transition-smooth font-medium"
            >
              Back to Tasks
            </button>
            <button
              @click="handleLogout"
              class="px-4 py-2 text-sm text-neutral-700 hover:text-neutral-900 border border-neutral-100 rounded-button hover:bg-neutral-50 transition-smooth font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>

    <main class="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
      <!-- Search and Filter -->
      <div class="mb-6 flex flex-col sm:flex-row gap-4">
        <div class="flex-1 relative">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search users by name or email..."
            class="w-full px-4 py-2 pl-10 border border-neutral-200 rounded-button focus:ring-2 focus:ring-primary-start focus:border-transparent outline-none"
          />
          <svg
            class="absolute left-3 top-2.5 w-5 h-5 text-neutral-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <select
          v-model="roleFilter"
          class="px-4 py-2 border border-neutral-200 rounded-button focus:ring-2 focus:ring-primary-start focus:border-transparent outline-none"
        >
          <option value="all">All Roles</option>
          <option value="manager">Managers</option>
          <option value="worker">Workers</option>
        </select>
      </div>

      <!-- Users Grid -->
      <div v-if="userStore.loading && filteredUsers.length === 0" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-start"></div>
        <p class="mt-3 text-neutral-500 font-medium">Loading users...</p>
      </div>

      <div v-else-if="filteredUsers.length === 0" class="text-center py-12">
        <div class="inline-block p-4 bg-neutral-100 rounded-card">
          <svg class="w-12 h-12 text-neutral-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <p class="text-neutral-500 font-medium">No users found</p>
        </div>
      </div>

      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        <div
          v-for="user in filteredUsers"
          :key="user.id"
          @click="viewUserProfile(user)"
          class="bg-white rounded-card shadow-soft p-6 cursor-pointer transition-smooth hover:shadow-card border border-neutral-100 hover:border-primary-start/20"
        >
          <div class="flex items-start justify-between mb-4">
            <div class="flex-1">
              <h3 class="text-lg font-semibold text-neutral-900 mb-1">{{ user.name }}</h3>
              <p class="text-sm text-neutral-500">{{ user.email }}</p>
            </div>
            <span
              :class="[
                'px-2 py-1 rounded-button text-xs font-semibold',
                user.role === 'manager' ? 'bg-blue-50 text-blue-700' : 'bg-green-50 text-green-700'
              ]"
            >
              {{ user.role === 'manager' ? 'Admin' : 'Worker' }}
            </span>
          </div>
          
          <div class="space-y-2 pt-4 border-t border-neutral-100">
            <div class="flex items-center justify-between text-sm">
              <span class="text-neutral-500">Assigned Tasks:</span>
              <span class="font-semibold text-neutral-900">{{ getUserTaskCount(user.id) }}</span>
            </div>
            <div class="flex items-center justify-between text-sm">
              <span class="text-neutral-500">Completed:</span>
              <span class="font-semibold text-success">{{ getUserCompletedCount(user.id) }}</span>
            </div>
            <div class="flex items-center justify-between text-sm">
              <span class="text-neutral-500">In Progress:</span>
              <span class="font-semibold text-warning">{{ getUserInProgressCount(user.id) }}</span>
            </div>
          </div>

          <button
            @click.stop="viewUserProfile(user)"
            class="mt-4 w-full px-4 py-2 text-sm bg-gradient-primary text-white rounded-button hover:shadow-card transition-smooth font-medium"
          >
            View Profile
          </button>
        </div>
      </div>
    </main>

    <!-- User Profile Modal -->
    <UserProfileModal
      :user="selectedUser"
      :visible="showProfileModal"
      @close="showProfileModal = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../store/auth'
import { useUserStore } from '../store/users'
import { useTaskStore } from '../store/tasks'
import type { User } from '../models/User'
import UserProfileModal from '../components/UserProfileModal.vue'

const router = useRouter()
const authStore = useAuthStore()
const userStore = useUserStore()
const taskStore = useTaskStore()

const searchQuery = ref('')
const roleFilter = ref<'all' | 'manager' | 'worker'>('all')
const showProfileModal = ref(false)
const selectedUser = ref<User | null>(null)

const filteredUsers = computed(() => {
  let users = userStore.users

  // Filter by role
  if (roleFilter.value !== 'all') {
    users = users.filter(u => u.role === roleFilter.value)
  }

  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    users = users.filter(u => 
      u.name.toLowerCase().includes(query) ||
      u.email.toLowerCase().includes(query)
    )
  }

  return users
})

function getUserTaskCount(userId: string): number {
  return taskStore.tasks.filter(t => t.assignedTo === userId).length
}

function getUserCompletedCount(userId: string): number {
  return taskStore.tasks.filter(t => t.assignedTo === userId && t.status === 'completed').length
}

function getUserInProgressCount(userId: string): number {
  return taskStore.tasks.filter(t => t.assignedTo === userId && t.status === 'in_progress').length
}

function viewUserProfile(user: User) {
  selectedUser.value = user
  showProfileModal.value = true
}

async function handleLogout() {
  await authStore.logout()
  router.push('/login')
}

onMounted(async () => {
  if (!authStore.isAuthenticated || !authStore.isManager) {
    router.push({ name: 'tasks' })
    return
  }

  await userStore.loadUsers()
  await taskStore.loadTasks()
})
</script>

