import { AuthService } from '../services/AuthService'
import { getAuthService } from '../api/ServiceFactory'
import type { User } from '../models/User'

export class AuthController {
  private authService: AuthService

  constructor() {
    this.authService = getAuthService()
  }

  async login(email: string, password: string, role: 'worker' | 'manager'): Promise<User | null> {
    return this.authService.login(email, password, role)
  }

  async register(
    email: string,
    password: string,
    name: string,
    role: 'worker' | 'manager',
    tenantId: string
  ): Promise<User | null> {
    return this.authService.register(email, password, name, role, tenantId)
  }

  async getCurrentUser(userId: string): Promise<User | null> {
    return this.authService.getCurrentUser(userId)
  }
}


