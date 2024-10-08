import User from '#models/user'
import { BasePolicy } from '@adonisjs/bouncer'
import { AuthorizerResponse } from '@adonisjs/bouncer/types'

export default class CompanyPolicy extends BasePolicy {
  view(user: User): AuthorizerResponse {
    return user.hasRole(user, 'Developer') || user.hasRole(user, 'Administrator')
  }
  update(user: User): AuthorizerResponse {
    return user.hasRole(user, 'Developer') || user.hasRole(user, 'Administrator')
  }
}
