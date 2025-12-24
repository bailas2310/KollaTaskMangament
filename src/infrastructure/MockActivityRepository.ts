import type { Activity } from '../domain/Activity'
import type { ActivityRepository } from './ActivityRepository'

export class MockActivityRepository implements ActivityRepository {
  private activities: Activity[] = []

  async findByTenant(tenantId: string, limit: number = 50): Promise<Activity[]> {
    return this.activities
      .filter(a => a.tenantId === tenantId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit)
  }

  async save(activity: Activity): Promise<Activity> {
    this.activities.unshift(activity)
    // Keep only last 100 activities
    if (this.activities.length > 100) {
      this.activities = this.activities.slice(0, 100)
    }
    return activity
  }
}


