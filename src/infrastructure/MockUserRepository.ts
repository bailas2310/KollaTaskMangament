import type { User } from '../domain/User'
import type { UserRepository } from './UserRepository'

export class MockUserRepository implements UserRepository {
  private users: User[] = [
    {
      id: 'user-1',
      name: 'John Worker',
      email: 'worker@kolla.com',
      role: 'worker',
      tenantId: 'tenant-1'
    },
    {
      id: 'user-2',
      name: 'Jane Worker',
      email: 'worker2@kolla.com',
      role: 'worker',
      tenantId: 'tenant-1'
    },
    {
      id: 'user-3',
      name: 'Manager Bob',
      email: 'manager@kolla.com',
      role: 'manager',
      tenantId: 'tenant-1'
    }
  ]

  async findById(id: string): Promise<User | null> {
    return this.users.find(u => u.id === id) || null
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.users.find(u => u.email === email) || null
  }

  async findAll(tenantId: string): Promise<User[]> {
    return this.users.filter(u => u.tenantId === tenantId)
  }
}


