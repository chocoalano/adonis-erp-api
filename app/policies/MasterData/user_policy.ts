import User from '#models/user'
import { BasePolicy } from '@adonisjs/bouncer'

export default class UserPolicy extends BasePolicy {
  // Fungsi untuk memeriksa izin dan peran
  private async hasRequiredPermission(user: User, permission: string): Promise<boolean> {
    const hasPermission = await user.hasPermission(user, permission)
    const isDeveloper = await user.hasRole(user, 'Developer')
    const isAdmin = await user.hasRole(user, 'Administrator')
    return hasPermission || isDeveloper || isAdmin
  }

  // Fungsi-fungsi tindakan yang memanggil fungsi umum
  async view(user: User): Promise<boolean> {
    return this.hasRequiredPermission(user, 'user-view')
  }

  async create(user: User): Promise<boolean> {
    return this.hasRequiredPermission(user, 'user-create')
  }

  async update(user: User): Promise<boolean> {
    return this.hasRequiredPermission(user, 'user-update')
  }

  async delete(user: User): Promise<boolean> {
    return this.hasRequiredPermission(user, 'user-delete')
  }
}
