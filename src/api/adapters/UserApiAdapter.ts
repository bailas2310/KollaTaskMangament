import type { User } from '../../models/User'
import type { UserRepository } from '../UserRepository'
import { AuthApiService } from '../services/AuthApiService'

/**
 * Adapter to make AuthApiService work like UserRepository
 */
export class UserApiAdapter implements UserRepository {
  constructor(private authApiService: AuthApiService) {}

  async findById(id: string): Promise<User | null> {
    try {
      const user = await this.authApiService.getCurrentUser()
      return user.id === id ? user : null
    } catch (error) {
      return null
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    // Note: Real API might have a different endpoint for this
    // This is a simplified version - adjust based on your backend
    try {
      const user = await this.authApiService.getCurrentUser()
      return user.email === email ? user : null
    } catch (error) {
      return null
    }
  }

  async findAll(tenantId: string): Promise<User[]> {
    // Note: This endpoint might need to be added to AuthApiService
    // For now, return empty array - implement when backend is ready
    return []
  }

  async save(user: User): Promise<User> {
    // In real API mode, registration is handled by AuthApiService.register()
    // This method is mainly for mock mode compatibility
    // If needed, you could add an update endpoint to AuthApiService
    return user
  }
}

