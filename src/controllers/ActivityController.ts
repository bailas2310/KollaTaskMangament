import { ActivityService } from '../services/ActivityService'
import { getActivityService } from '../api/ServiceFactory'
import type { Activity, ActivityType } from '../models/Activity'
import type { Task } from '../models/Task'
import type { User } from '../models/User'

export class ActivityController {
  private activityService: ActivityService

  constructor() {
    this.activityService = getActivityService()
  }

  async createActivity(
    type: ActivityType,
    message: string,
    user: User,
    task?: Task
  ): Promise<Activity> {
    return this.activityService.createActivity(type, message, user, task)
  }

  async getRecentActivities(tenantId: string, limit: number = 20): Promise<Activity[]> {
    return this.activityService.getRecentActivities(tenantId, limit)
  }
}


