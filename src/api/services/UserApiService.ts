import { apiClient } from '../client'
import { API_CONFIG } from '../config'
import type { User } from '../../models/User'

/**
 * User API Service
 * Handles user-related API calls
 */
export class UserApiService {
  async getAllUsers(tenantId: string): Promise<User[]> {
    return apiClient.get<User[]>(API_CONFIG.endpoints.users.list, {
      params: { tenantId }
    })
  }

  async getUserById(id: string, tenantId: string): Promise<User> {
    return apiClient.get<User>(API_CONFIG.endpoints.users.get(id), {
      params: { tenantId }
    })
  }

  async getUserByEmail(email: string, tenantId: string): Promise<User | null> {
    try {
      return await apiClient.get<User>(API_CONFIG.endpoints.users.getByEmail(email), {
        params: { tenantId }
      })
    } catch {
      return null
    }
  }

  async createUser(user: Omit<User, 'id'>): Promise<User> {
    return apiClient.post<User>(API_CONFIG.endpoints.users.list, user)
  }

  async updateUser(id: string, user: Partial<User>): Promise<User> {
    return apiClient.put<User>(API_CONFIG.endpoints.users.get(id), user)
  }

  async deleteUser(id: string, tenantId: string): Promise<void> {
    return apiClient.delete(API_CONFIG.endpoints.users.get(id), {
      params: { tenantId }
    })
  }
}

