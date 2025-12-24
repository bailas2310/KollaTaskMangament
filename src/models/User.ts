import type { UserRole } from './Task'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  tenantId: string
}


