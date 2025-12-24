import type { User } from '../models/User'

export interface UserRepository {
  findById(id: string): Promise<User | null>
  findByEmail(email: string): Promise<User | null>
  findAll(tenantId: string): Promise<User[]>
  save(user: User): Promise<User>
}


