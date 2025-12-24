<template>
  <div class="bg-white rounded-card shadow-soft p-6">
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center gap-2">
        <h3 class="text-lg font-semibold text-neutral-900">Live Activity Feed</h3>
        <span
          v-if="isLive"
          class="relative flex h-3 w-3"
        >
          <span
            class="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"
          ></span>
          <span
            class="relative inline-flex rounded-full h-3 w-3 bg-success"
          ></span>
        </span>
      </div>
      <span class="text-xs text-neutral-500">Last updated: {{ lastUpdateTime }}</span>
    </div>

    <div v-if="loading && activities.length === 0" class="text-center py-8">
      <div class="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-primary-start"></div>
      <p class="mt-2 text-sm text-neutral-500">Loading activities...</p>
    </div>

    <div v-else-if="activities.length === 0" class="text-center py-8 text-neutral-500 text-sm">
      No recent activity
    </div>

    <div v-else class="space-y-3 max-h-96 overflow-y-auto">
      <div
        v-for="activity in activities"
        :key="activity.id"
        class="flex gap-3 p-3 rounded-button hover:bg-neutral-50 transition-smooth"
      >
        <div class="flex-shrink-0">
          <div
            :class="[
              'w-2 h-2 rounded-full mt-2',
              getActivityColor(activity.type)
            ]"
          ></div>
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm text-neutral-900">
            <span class="font-medium">{{ activity.userName }}</span>
            <span class="text-neutral-600"> {{ activity.message }}</span>
          </p>
          <p class="text-xs text-neutral-500 mt-1">
            {{ formatTime(activity.timestamp) }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import type { Activity } from '../models/Activity'
import { useActivityStore } from '../store/activity'

const activityStore = useActivityStore()

const activities = computed(() => activityStore.recentActivities)
const loading = computed(() => activityStore.loading)
const isLive = ref(true)
const lastUpdateTime = ref('Just now')

let updateInterval: number | null = null

onMounted(async () => {
  await activityStore.loadActivities()
  updateLastUpdateTime()
  
  // Update every 20 seconds
  updateInterval = window.setInterval(async () => {
    await activityStore.loadActivities()
    updateLastUpdateTime()
  }, 20000)
})

onUnmounted(() => {
  if (updateInterval !== null) {
    clearInterval(updateInterval)
  }
})

function getActivityColor(type: Activity['type']): string {
  const colors: Record<Activity['type'], string> = {
    task_created: 'bg-primary-start',
    task_completed: 'bg-success',
    task_updated: 'bg-warning',
    priority_changed: 'bg-primary-end',
    status_changed: 'bg-neutral-500'
  }
  return colors[type] || 'bg-neutral-500'
}

function formatTime(timestamp: Date | string): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function updateLastUpdateTime() {
  const now = new Date()
  lastUpdateTime.value = now.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit' 
  })
}
</script>

