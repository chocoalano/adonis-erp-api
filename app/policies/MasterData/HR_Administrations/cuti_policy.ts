import User from '#models/user'
import { BasePolicy } from '@adonisjs/bouncer'

export default class CutiPolicy extends BasePolicy {
  async view(user: User) {
    const hasPermission = await user.hasPermission(user, 'cuti-view')
    const isDeveloper = await user.hasRole(user, 'Developer')
    const isAdmin = await user.hasRole(user, 'Administrator')
    return hasPermission || isDeveloper || isAdmin
  }
  async create(user: User) {
    const hasPermission = await user.hasPermission(user, 'cuti-create')
    const isDeveloper = await user.hasRole(user, 'Developer')
    const isAdmin = await user.hasRole(user, 'Administrator')
    return hasPermission || isDeveloper || isAdmin
  }
  async update(user: User) {
    const hasPermission = await user.hasPermission(user, 'cuti-update')
    const isDeveloper = await user.hasRole(user, 'Developer')
    const isAdmin = await user.hasRole(user, 'Administrator')
    return hasPermission || isDeveloper || isAdmin
  }
  async delete(user: User) {
    const hasPermission = await user.hasPermission(user, 'cuti-delete')
    const isDeveloper = await user.hasRole(user, 'Developer')
    const isAdmin = await user.hasRole(user, 'Administrator')
    return hasPermission || isDeveloper || isAdmin
  }
}
