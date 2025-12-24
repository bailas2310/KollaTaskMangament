import type { Activity, ActivityType } from '../models/Activity'
import type { ActivityRepository } from '../api/ActivityRepository'
import type { Task } from '../models/Task'
import type { User } from '../models/User'

export class ActivityService {
  constructor(private activityRepository: ActivityRepository) {}

  async createActivity(
    type: ActivityType,
    message: string,
    user: User,
    task?: Task
  ): Promise<Activity> {
    const activity: Activity = {
      id: this.generateId(),
      type,
      message,
      taskId: task?.id,
      taskTitle: task?.title,
      userId: user.id,
      userName: user.name,
      tenantId: user.tenantId,
      timestamp: new Date()
    }

    return this.activityRepository.save(activity)
  }

  async getRecentActivities(tenantId: string, limit: number = 20): Promise<Activity[]> {
    return this.activityRepository.findByTenant(tenantId, limit)
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }
}


