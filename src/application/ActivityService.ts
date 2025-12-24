import type { Activity, ActivityType } from '../domain/Activity'
import type { ActivityRepository } from '../infrastructure/ActivityRepository'
import type { Task } from '../domain/Task'
import type { User } from '../domain/User'

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


