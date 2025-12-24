import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios'
import { API_CONFIG } from './config'

/**
 * Axios API Client
 * Handles HTTP requests with interceptors for error handling and auth
 */
class ApiClient {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: API_CONFIG.baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    })

    this.setupInterceptors()
  }

  private setupInterceptors(): void {
    // Request interceptor - add auth token if available
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('kolla_token')
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )

    // Response interceptor - handle errors
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        return response
      },
      (error) => {
        if (error.response) {
          // Handle different error status codes
          switch (error.response.status) {
            case 401:
              // Unauthorized - clear auth and redirect to login
              localStorage.removeItem('kolla_token')
              localStorage.removeItem('kolla_user')
              window.location.href = '/login'
              break
            case 403:
              console.error('Forbidden: You do not have permission to access this resource')
              break
            case 404:
              console.error('Resource not found')
              break
            case 500:
              console.error('Server error: Please try again later')
              break
            default:
              console.error('An error occurred:', error.response.data?.message || error.message)
          }
        } else if (error.request) {
          console.error('Network error: Please check your connection')
        } else {
          console.error('Error:', error.message)
        }
        return Promise.reject(error)
      }
    )
  }

  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(url, config)
    return response.data
  }

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<T>(url, data, config)
    return response.data
  }

  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put<T>(url, data, config)
    return response.data
  }

  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.patch<T>(url, data, config)
    return response.data
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<T>(url, config)
    return response.data
  }
}

export const apiClient = new ApiClient()

