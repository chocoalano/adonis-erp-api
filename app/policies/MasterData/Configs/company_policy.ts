import User from '#models/user'
import { BasePolicy } from '@adonisjs/bouncer'
import { AuthorizerResponse } from '@adonisjs/bouncer/types'

export default class CompanyPolicy extends BasePolicy {
  private async hasRequiredRole(user: User): Promise<boolean> {
    const hasDeveloperRole = await user.hasRole(user, 'Developer')
    const hasAdminRole = await user.hasRole(user, 'Administrator')
    return hasDeveloperRole || hasAdminRole
  }
  view(user: User): AuthorizerResponse {
    return this.hasRequiredRole(user)
  }
  update(user: User): AuthorizerResponse {
    return this.hasRequiredRole(user)
  }
}
