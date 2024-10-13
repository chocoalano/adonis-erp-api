import User from '#models/user'
import { BasePolicy } from '@adonisjs/bouncer'

export default class KoreksiAbsenPolicy extends BasePolicy {
  private async hasRequiredPermission(user: User, permission: string): Promise<boolean> {
    const hasPermission = await user.hasPermission(user, permission)
    const isDeveloper = await user.hasRole(user, 'Developer')
    const isAdmin = await user.hasRole(user, 'Administrator')
    return hasPermission || isDeveloper || isAdmin
  }
  async view(user: User) {
    return this.hasRequiredPermission(user, 'koreksi-absen-view')
  }
  async create(user: User) {
    return this.hasRequiredPermission(user, 'koreksi-absen-create')
  }
  async update(user: User) {
    return this.hasRequiredPermission(user, 'koreksi-absen-update')
  }
  async delete(user: User) {
    return this.hasRequiredPermission(user, 'koreksi-absen-delete')
  }
}
