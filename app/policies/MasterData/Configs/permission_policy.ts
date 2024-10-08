import User from '#models/user'
import { BasePolicy } from '@adonisjs/bouncer'
import { AuthorizerResponse } from '@adonisjs/bouncer/types'

export default class PermissionPolicy extends BasePolicy {
  view(user: User): AuthorizerResponse {
    return user.hasRole(user, 'Developer') || user.hasRole(user, 'Administrator')
  }
  create(user: User): AuthorizerResponse {
    return user.hasRole(user, 'Developer') || user.hasRole(user, 'Administrator')
  }
  update(user: User): AuthorizerResponse {
    return user.hasRole(user, 'Developer') || user.hasRole(user, 'Administrator')
  }
  delete(user: User): AuthorizerResponse {
    return user.hasRole(user, 'Developer') || user.hasRole(user, 'Administrator')
  }
}
