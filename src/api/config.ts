/**
 * API Configuration
 * Toggle between mock and real API using useMock flag
 */
export const API_CONFIG = {
  // Set to false when backend is ready
  useMock: true,
  
  // API Base URL (will be used when useMock is false)
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  
  // API endpoints
  endpoints: {
    auth: {
      login: '/auth/login',
      register: '/auth/register',
      currentUser: '/auth/me',
      logout: '/auth/logout'
    },
    tasks: {
      list: '/tasks',
      get: (id: string) => `/tasks/${id}`,
      create: '/tasks',
      update: (id: string) => `/tasks/${id}`,
      delete: (id: string) => `/tasks/${id}`,
      updateStatus: (id: string) => `/tasks/${id}/status`,
      overridePriority: (id: string) => `/tasks/${id}/priority`,
      refreshPriorities: '/tasks/refresh-priorities'
    },
    notifications: {
      list: '/notifications',
      markAsRead: (id: string) => `/notifications/${id}/read`,
      markAllAsRead: '/notifications/read-all'
    },
    activities: {
      list: '/activities',
      create: '/activities'
    },
    users: {
      list: '/users',
      get: (id: string) => `/users/${id}`,
      getByEmail: (email: string) => `/users/email/${email}`
    }
  }
}

