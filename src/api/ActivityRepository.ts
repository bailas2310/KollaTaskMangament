import type { Activity } from '../models/Activity'

export interface ActivityRepository {
  findByTenant(tenantId: string, limit?: number): Promise<Activity[]>
  save(activity: Activity): Promise<Activity>
}


