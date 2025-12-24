import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Activity } from '../models/Activity'
import { getActivityService } from '../api/ServiceFactory'
import { useAuthStore } from './auth'

export const useActivityStore = defineStore('activity', () => {
  const activities = ref<Activity[]>([])
  const loading = ref(false)

  const authStore = useAuthStore()

  const recentActivities = computed(() => activities.value.slice(0, 10))

  async function loadActivities() {
    if (!authStore.user) return

    loading.value = true
    try {
      const activityService = getActivityService()
      const loaded = await activityService.getRecentActivities(
        authStore.user.tenantId,
        20
      )
      activities.value = loaded
    } finally {
      loading.value = false
    }
  }

  return {
    activities,
    recentActivities,
    loading,
    loadActivities
  }
})

