import User from '#models/user'
import { BasePolicy } from '@adonisjs/bouncer'

export default class AttendancePolicy extends BasePolicy {
  private async hasRequiredPermission(user: User, permission: string): Promise<boolean> {
    const hasPermission = await user.hasPermission(user, permission)
    const isDeveloper = await user.hasRole(user, 'Developer')
    const isAdmin = await user.hasRole(user, 'Administrator')
    const isAdminProduksi = await user.hasRole(user, 'Admin-Produksi')
    return hasPermission || isDeveloper || isAdmin || isAdminProduksi
  }
  async view(user: User) {
    return this.hasRequiredPermission(user, 'attendance-view')
  }
  async create(user: User) {
    return this.hasRequiredPermission(user, 'attendance-create')
  }
  async update(user: User) {
    return this.hasRequiredPermission(user, 'attendance-update')
  }
  async delete(user: User) {
    return this.hasRequiredPermission(user, 'attendance-delete')
  }
}
