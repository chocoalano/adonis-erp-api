import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'
import { apiThrottle } from '../limiter.js'
router.post('login', '#controllers/auth_controller.login').use(apiThrottle)
router
  .group(() => {
    router.get('logout', '#controllers/auth_controller.logout')
    router.get('user-auth', '#controllers/auth_controller.user_auth')
    router.put('user-update/:id', '#controllers/auth_controller.update')
    router.post('user-update/:datatype', '#controllers/auth_controller.updateMobile')
    router.get(
      'users-kelengkapan-form',
      '#controllers/masterdata/users_controller.kelengkapan_form'
    )
    router.delete('user-remove/:datatype/:id', '#controllers/auth_controller.remove_data')
  })
  .use(
    middleware.auth({
      guards: ['api'],
    })
  )
  .use(apiThrottle)
