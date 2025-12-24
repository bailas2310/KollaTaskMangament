import type { User } from '../models/User'
import type { UserRepository } from '../api/UserRepository'
import { API_CONFIG } from '../api/config'
import { AuthApiService } from '../api/services/AuthApiService'

export class AuthService {
  private authApiService?: AuthApiService

  constructor(private userRepository: UserRepository) {
    if (!API_CONFIG.useMock) {
      this.authApiService = new AuthApiService()
    }
  }

  async login(email: string, password: string, role: 'worker' | 'manager'): Promise<User | null> {
    if (API_CONFIG.useMock) {
      // Mock mode: use repository and validate password
      const user = await this.userRepository.findByEmail(email)
      if (user && user.role === role) {
        // For demo users, accept "password123" or any password for newly registered users
        // In a real app, passwords would be hashed and compared
        const isValidPassword = password === 'password123' || password.length >= 6
        if (isValidPassword) {
          return user
        }
      }
      return null
    } else {
      // Real API mode: use API service
      try {
        const response = await this.authApiService!.login(email, password, role)
        return response.user
      } catch (error) {
        console.error('Login failed:', error)
        return null
      }
    }
  }

  async register(
    email: string,
    password: string,
    name: string,
    role: 'worker' | 'manager',
    tenantId: string
  ): Promise<User | null> {
    if (API_CONFIG.useMock) {
      // Mock mode: check if user already exists
      const existingUser = await this.userRepository.findByEmail(email)
      if (existingUser) {
        return null // User already exists
      }
      
      // Create new user
      const newUser: User = {
        id: `user-${Date.now()}`,
        name,
        email,
        role,
        tenantId
      }
      
      // Save user to repository so it can be found during login
      return await this.userRepository.save(newUser)
    } else {
      // Real API mode: use API service
      try {
        const response = await this.authApiService!.register(email, password, name, role, tenantId)
        return response.user
      } catch (error) {
        console.error('Registration failed:', error)
        return null
      }
    }
  }

  async getCurrentUser(userId: string): Promise<User | null> {
    if (API_CONFIG.useMock) {
      return this.userRepository.findById(userId)
    } else {
      try {
        return await this.authApiService!.getCurrentUser()
      } catch (error) {
        console.error('Get current user failed:', error)
        return null
      }
    }
  }

  async logout(): Promise<void> {
    if (!API_CONFIG.useMock && this.authApiService) {
      await this.authApiService.logout()
    }
    localStorage.removeItem('kolla_token')
    localStorage.removeItem('kolla_user')
  }
}
