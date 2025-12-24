import { apiClient } from '../client'
import { API_CONFIG } from '../config'
import type { User } from '../../models/User'

/**
 * Auth API Service
 * Handles authentication API calls
 */
export class AuthApiService {
  async login(email: string, password: string, role: 'worker' | 'manager'): Promise<{ user: User; token: string }> {
    const response = await apiClient.post<{ user: User; token: string }>(
      API_CONFIG.endpoints.auth.login,
      { email, password, role }
    )
    
    // Store token
    if (response.token) {
      localStorage.setItem('kolla_token', response.token)
    }
    
    return response
  }

  async register(
    email: string,
    password: string,
    name: string,
    role: 'worker' | 'manager',
    tenantId: string
  ): Promise<{ user: User; token: string }> {
    const response = await apiClient.post<{ user: User; token: string }>(
      API_CONFIG.endpoints.auth.register,
      { email, password, name, role, tenantId }
    )
    
    if (response.token) {
      localStorage.setItem('kolla_token', response.token)
    }
    
    return response
  }

  async getCurrentUser(): Promise<User> {
    return apiClient.get<User>(API_CONFIG.endpoints.auth.currentUser)
  }

  async logout(): Promise<void> {
    await apiClient.post(API_CONFIG.endpoints.auth.logout)
    localStorage.removeItem('kolla_token')
  }
}

