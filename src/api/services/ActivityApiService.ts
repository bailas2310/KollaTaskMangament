import { apiClient } from '../client'
import { API_CONFIG } from '../config'
import type { Activity } from '../../models/Activity'

/**
 * Activity API Service
 * Handles activity feed API calls
 */
export class ActivityApiService {
  async getRecentActivities(tenantId: string, limit: number = 20): Promise<Activity[]> {
    return apiClient.get<Activity[]>(API_CONFIG.endpoints.activities.list, {
      params: { tenantId, limit }
    })
  }

  async createActivity(activity: Omit<Activity, 'id' | 'timestamp'>): Promise<Activity> {
    return apiClient.post<Activity>(API_CONFIG.endpoints.activities.create, activity)
  }
}

