import type { User } from '../domain/User'

export interface UserRepository {
  findById(id: string): Promise<User | null>
  findByEmail(email: string): Promise<User | null>
  findAll(tenantId: string): Promise<User[]>
}


