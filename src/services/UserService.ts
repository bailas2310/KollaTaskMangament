import type { User } from '../models/User'
import type { UserRepository } from '../api/UserRepository'

/**
 * User Service
 * Business logic for user management
 */
export class UserService {
  constructor(private userRepository: UserRepository) {}

  async getAllUsers(tenantId: string): Promise<User[]> {
    return this.userRepository.findAll(tenantId)
  }

  async getUserById(id: string): Promise<User | null> {
    return this.userRepository.findById(id)
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return this.userRepository.findByEmail(email)
  }

  async createUser(user: Omit<User, 'id'>): Promise<User> {
    // Generate ID for new user
    const newUser: User = {
      ...user,
      id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    }
    return this.userRepository.save(newUser)
  }

  async updateUser(user: User): Promise<User> {
    return this.userRepository.save(user)
  }
}

