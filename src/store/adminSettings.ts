import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { AdminSettings } from '../models/AdminSettings'
import { DEFAULT_ADMIN_SETTINGS } from '../models/AdminSettings'
import { useAuthStore } from './auth'

export const useAdminSettingsStore = defineStore('adminSettings', () => {
  const settings = ref<AdminSettings>(DEFAULT_ADMIN_SETTINGS)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const authStore = useAuthStore()

  // Computed properties for easy access
  const canUsersChangePriority = computed(() => settings.value.allowUsersPriorityChange)
  const canUsersForwardTasks = computed(() => settings.value.allowUsersTaskForwarding)
  const requiresApprovalForPriority = computed(() => settings.value.requireApprovalForPriorityChange)

  // Load settings from localStorage or API
  function loadSettings() {
    const stored = localStorage.getItem('kolla_admin_settings')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        settings.value = {
          ...parsed,
          updatedAt: new Date(parsed.updatedAt),
        }
      } catch (e) {
        console.error('Failed to parse admin settings:', e)
        settings.value = { ...DEFAULT_ADMIN_SETTINGS }
      }
    } else {
      settings.value = { ...DEFAULT_ADMIN_SETTINGS }
    }
  }

  // Update settings (only managers can do this)
  async function updateSettings(newSettings: Partial<AdminSettings>) {
    if (!authStore.isManager) {
      throw new Error('Only managers can update admin settings')
    }

    loading.value = true
    error.value = null

    try {
      const updated: AdminSettings = {
        ...settings.value,
        ...newSettings,
        updatedAt: new Date(),
        updatedBy: authStore.user?.id || '',
      }

      // In real API, this would be an API call
      // For now, we'll store in localStorage
      localStorage.setItem('kolla_admin_settings', JSON.stringify(updated))
      settings.value = updated

      return updated
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to update settings'
      throw e
    } finally {
      loading.value = false
    }
  }

  // Initialize settings on store creation
  loadSettings()

  return {
    settings,
    loading,
    error,
    canUsersChangePriority,
    canUsersForwardTasks,
    requiresApprovalForPriority,
    loadSettings,
    updateSettings,
  }
})

