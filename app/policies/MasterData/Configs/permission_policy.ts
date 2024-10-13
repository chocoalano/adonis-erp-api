import User from '#models/user'
import { BasePolicy } from '@adonisjs/bouncer'
import { AuthorizerResponse } from '@adonisjs/bouncer/types'

export default class PermissionPolicy extends BasePolicy {
  private async hasRequiredRole(user: User): Promise<boolean> {
    const hasDeveloperRole = await user.hasRole(user, 'Developer')
    const hasAdminRole = await user.hasRole(user, 'Administrator')
    return hasDeveloperRole || hasAdminRole
  }
  view(user: User): AuthorizerResponse {
    return this.hasRequiredRole(user)
  }
  create(user: User): AuthorizerResponse {
    return this.hasRequiredRole(user)
  }
  update(user: User): AuthorizerResponse {
    return this.hasRequiredRole(user)
  }
  delete(user: User): AuthorizerResponse {
    return this.hasRequiredRole(user)
  }
}
