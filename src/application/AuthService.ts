import type { User } from '../domain/User'
import type { UserRepository } from '../infrastructure/UserRepository'

export class AuthService {
  constructor(private userRepository: UserRepository) {}

  async login(email: string, password: string): Promise<User | null> {
    // For prototype, we'll use mock users
    const user = await this.userRepository.findByEmail(email)

    if (user) {
      // For demo users, accept "password123" or any password for newly registered users
      // In a real app, passwords would be hashed and compared
      const isValidPassword = password === 'password123' || password.length >= 6
      if (isValidPassword) {
        return user
      }
    }

    return null
  }

  async getCurrentUser(userId: string): Promise<User | null> {
    return this.userRepository.findById(userId)
  }
}


