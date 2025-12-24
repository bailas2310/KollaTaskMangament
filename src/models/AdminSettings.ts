export interface AdminSettings {
  id: string
  tenantId: string
  allowUsersPriorityChange: boolean // default: false
  allowUsersTaskForwarding: boolean // default: false
  requireApprovalForPriorityChange: boolean // default: true
  updatedAt: Date
  updatedBy: string // userId of admin who updated
}

export const DEFAULT_ADMIN_SETTINGS: AdminSettings = {
  id: 'default-settings',
  tenantId: 'tenant-1',
  allowUsersPriorityChange: false,
  allowUsersTaskForwarding: false,
  requireApprovalForPriorityChange: true,
  updatedAt: new Date(),
  updatedBy: ''
}

