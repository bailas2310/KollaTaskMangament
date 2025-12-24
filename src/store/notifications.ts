import { defineStore } from 'pinia'
import { ref, computed, onUnmounted } from 'vue'
import type { Notification } from '../models/Notification'
import { getNotificationService } from '../api/ServiceFactory'
import { useAuthStore } from './auth'
import { WebSocketService } from '../services/WebSocketService'
import { API_CONFIG } from '../api/config'

export const useNotificationStore = defineStore('notifications', () => {
  const notifications = ref<Notification[]>([])
  const loading = ref(false)
  const wsService = ref<WebSocketService | null>(null)
  const isRealTimeEnabled = ref(false)

  const authStore = useAuthStore()

  const unreadCount = computed(() => 
    notifications.value.filter(n => !n.read).length
  )

  const unreadNotifications = computed(() => 
    notifications.value.filter(n => !n.read)
  )

  const sortedNotifications = computed(() => {
    return [...notifications.value].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  })

  async function loadNotifications() {
    if (!authStore.user) return

    loading.value = true
    try {
      const notificationService = getNotificationService()
      const loaded = await notificationService.getNotifications(
        authStore.user.id,
        authStore.user.tenantId
      )
      notifications.value = loaded
    } finally {
      loading.value = false
    }
  }

  async function markAsRead(notificationId: string) {
    if (!authStore.user) return

    try {
      const notificationService = getNotificationService()
      await notificationService.markAsRead(
        notificationId,
        authStore.user.id,
        authStore.user.tenantId
      )
      await loadNotifications()
    } catch (e) {
      console.error('Failed to mark notification as read', e)
    }
  }

  async function markAllAsRead() {
    if (!authStore.user) return

    try {
      const notificationService = getNotificationService()
      await notificationService.markAllAsRead(
        authStore.user.id,
        authStore.user.tenantId
      )
      await loadNotifications()
    } catch (e) {
      console.error('Failed to mark all notifications as read', e)
    }
  }

  function addNotification(notification: Notification) {
    // Check if notification already exists
    const exists = notifications.value.find(n => n.id === notification.id)
    if (!exists) {
      notifications.value.unshift(notification)
    }
  }

  async function enableRealTime() {
    if (!authStore.user || isRealTimeEnabled.value) return

    try {
      // In mock mode, simulate real-time with polling
      // In real API mode, use WebSocket
      if (!API_CONFIG.useMock) {
        const token = localStorage.getItem('kolla_token')
        const wsUrl = API_CONFIG.baseURL.replace('/api', '').replace('http', 'ws') + '/notifications'
        wsService.value = new WebSocketService(wsUrl, token || undefined)
        
        await wsService.value.connect()
        
        // Listen for new notifications
        wsService.value.on('notification', (data: { notification: Notification }) => {
          if (data.notification.userId === authStore.user?.id) {
            addNotification(data.notification)
          }
        })

        isRealTimeEnabled.value = true
      } else {
        // In mock mode, use polling as fallback
        // Poll every 5 seconds for new notifications
        const pollInterval = setInterval(async () => {
          if (authStore.user) {
            await loadNotifications()
          } else {
            clearInterval(pollInterval)
          }
        }, 5000)

        // Store interval ID for cleanup
        ;(wsService.value as any) = { pollInterval }
        isRealTimeEnabled.value = true
      }
    } catch (error) {
      console.error('Failed to enable real-time notifications:', error)
    }
  }

  function disableRealTime() {
    if (wsService.value) {
      if (wsService.value instanceof WebSocketService) {
        wsService.value.disconnect()
      } else if ((wsService.value as any).pollInterval) {
        clearInterval((wsService.value as any).pollInterval)
      }
      wsService.value = null
    }
    isRealTimeEnabled.value = false
  }

  return {
    notifications,
    unreadCount,
    unreadNotifications,
    sortedNotifications,
    loading,
    isRealTimeEnabled,
    loadNotifications,
    markAsRead,
    markAllAsRead,
    addNotification,
    enableRealTime,
    disableRealTime
  }
})

