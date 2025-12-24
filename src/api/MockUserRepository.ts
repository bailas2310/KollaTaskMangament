import type { User } from '../models/User'
import type { UserRepository } from './UserRepository'

export class MockUserRepository implements UserRepository {
  private users: User[] = [
    {
      id: 'user-bailasan',
      name: 'Bailasan',
      email: 'Bailasan@gmail.com',
      role: 'manager',
      tenantId: 'tenant-1'
    },
    {
      id: 'user-ronaldo',
      name: 'Ronaldo',
      email: 'ronaldo@gmail.com',
      role: 'worker',
      tenantId: 'tenant-1'
    },
    {
      id: 'user-moh',
      name: 'Moh',
      email: 'moh@gmail.com',
      role: 'worker',
      tenantId: 'tenant-1'
    },
    {
      id: 'user-merveilles',
      name: 'Merveilles',
      email: 'Merveilles@gmail.com',
      role: 'worker',
      tenantId: 'tenant-1'
    },
    {
      id: 'user-hanif',
      name: 'Hanif',
      email: 'hanif@gmail.com',
      role: 'worker',
      tenantId: 'tenant-1'
    },
    {
      id: 'user-bosco',
      name: 'Bosco',
      email: 'bosco@gmail.com',
      role: 'worker',
      tenantId: 'tenant-1'
    },
    {
      id: 'user-mohamed',
      name: 'Mohamed',
      email: 'mohamed@kolla.com',
      role: 'worker',
      tenantId: 'tenant-1'
    },
    {
      id: 'user-alice',
      name: 'Alice',
      email: 'alice@kolla.com',
      role: 'manager',
      tenantId: 'tenant-1'
    },
    {
      id: 'user-2',
      name: 'Jane Worker',
      email: 'worker2@kolla.com',
      role: 'worker',
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

  async save(user: User): Promise<User> {
    const existingIndex = this.users.findIndex(u => u.id === user.id || u.email === user.email)
    if (existingIndex >= 0) {
      this.users[existingIndex] = user
    } else {
      this.users.push(user)
    }
    return user
  }
}
