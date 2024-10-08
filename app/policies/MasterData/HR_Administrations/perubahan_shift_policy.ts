import User from '#models/user'
import { BasePolicy } from '@adonisjs/bouncer'

export default class PerubahanShiftPolicy extends BasePolicy {
  async view(user: User) {
    const hasPermission = await user.hasPermission(user, 'perubahan-shift-view')
    const isDeveloper = await user.hasRole(user, 'Developer')
    const isAdmin = await user.hasRole(user, 'Administrator')
    return hasPermission || isDeveloper || isAdmin
  }
  async create(user: User) {
    const hasPermission = await user.hasPermission(user, 'perubahan-shift-create')
    const isDeveloper = await user.hasRole(user, 'Developer')
    const isAdmin = await user.hasRole(user, 'Administrator')
    return hasPermission || isDeveloper || isAdmin
  }
  async update(user: User) {
    const hasPermission = await user.hasPermission(user, 'perubahan-shift-update')
    const isDeveloper = await user.hasRole(user, 'Developer')
    const isAdmin = await user.hasRole(user, 'Administrator')
    return hasPermission || isDeveloper || isAdmin
  }
  async delete(user: User) {
    const hasPermission = await user.hasPermission(user, 'perubahan-shift-delete')
    const isDeveloper = await user.hasRole(user, 'Developer')
    const isAdmin = await user.hasRole(user, 'Administrator')
    return hasPermission || isDeveloper || isAdmin
  }
}
