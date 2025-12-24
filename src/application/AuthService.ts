import type { User } from '../domain/User'
import type { UserRepository } from '../infrastructure/UserRepository'

export class AuthService {
  constructor(private userRepository: UserRepository) {}

  async login(email: string, role: 'worker' | 'manager'): Promise<User | null> {
    // For prototype, we'll use mock users
    const user = await this.userRepository.findByEmail(email)
    
    if (user && user.role === role) {
      return user
    }
    
    return null
  }

  async getCurrentUser(userId: string): Promise<User | null> {
    return this.userRepository.findById(userId)
  }
}


