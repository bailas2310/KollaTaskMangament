import type { Activity } from '../../models/Activity'
import type { ActivityRepository } from '../ActivityRepository'
import { ActivityApiService } from '../services/ActivityApiService'

/**
 * Adapter to make ActivityApiService work like ActivityRepository
 */
export class ActivityApiAdapter implements ActivityRepository {
  constructor(private apiService: ActivityApiService) {}

  async findByTenant(tenantId: string, limit: number = 50): Promise<Activity[]> {
    return this.apiService.getRecentActivities(tenantId, limit)
  }

  async save(activity: Activity): Promise<Activity> {
    return this.apiService.createActivity({
      type: activity.type,
      message: activity.message,
      taskId: activity.taskId,
      taskTitle: activity.taskTitle,
      userId: activity.userId,
      userName: activity.userName,
      tenantId: activity.tenantId
    })
  }
}

