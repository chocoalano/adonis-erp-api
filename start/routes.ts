import { sep, normalize } from 'node:path'
import app from '@adonisjs/core/services/app'
import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'
import { apiThrottle } from './limiter.js'

const PATH_TRAVERSAL_REGEX = /(?:^|[\\/])\.\.(?:[\\/]|$)/
router.get('/files/*', ({ request, response }) => {
  const filePath = request.param('*').join(sep)
  const normalizedPath = normalize(filePath)

  if (PATH_TRAVERSAL_REGEX.test(normalizedPath)) {
    return response.badRequest('Malformed path')
  }
  const absolutePath = app.makePath(`storage/uploads/${normalizedPath}`)
  return response.download(absolutePath)
})

router.get('/', () => {
  return 'Hello world from the home page.'
})
router.post('login', '#controllers/auth_controller.login').use(apiThrottle)
router
  .group(() => {
    router.get('logout', '#controllers/auth_controller.logout')
    router.get('user-auth', '#controllers/auth_controller.user_auth')
    router.put('user-update/:id', '#controllers/auth_controller.update')
    router.post('user-update-mobile/:datatype', '#controllers/auth_controller.updateMobile')
    router.get(
      'users-kelengkapan-form',
      '#controllers/masterdata/users_controller.kelengkapan_form'
    )
  })
  .use(
    middleware.auth({
      guards: ['api'],
    })
  )
  .use(apiThrottle)

// route for web
router
  .group(() => {
    router.get('dashboard', '#controllers/dashboard_controller.index')
    router.resource('role', '#controllers/configs/role_controller')
    router.resource('users', '#controllers/masterdata/users_controller')
    router.resource('announcement', '#controllers/masterdata/announcement_controller')
    router.resource('attendance', '#controllers/administrations/attendances_controller')
    router.resource('company', '#controllers/configs/companies_controller')
    router.resource('bug', '#controllers/configs/bug_controller')
    router.resource('branch', '#controllers/configs/branches_controller')
    router.resource('level', '#controllers/configs/levels_controller')
    router.resource('dept', '#controllers/configs/organizations_controller')
    router.resource('job', '#controllers/configs/jobs_controller')
    router.resource('time', '#controllers/configs/time_configs_controller')
    router.resource('attendance-group', '#controllers/administrations/group_absens_controller')
    router.resource(
      'attendance-group-schedule',
      '#controllers/administrations/schedule_group_absens_controller'
    )
    router.resource('work-overtime', '#controllers/administrations/work_overtime_controller')
    router.resource('cuti', '#controllers/administrations/cuti_controller')
    router.resource('perubahan-shift', '#controllers/administrations/perubahan_shifts_controller')
    router.resource('koreksi-absen', '#controllers/administrations/koreksi_absen_controller')
    router.get('time-all', '#controllers/configs/time_configs_controller.showAll')
    router.resource('notification', '#controllers/configs/notification_controller')
  })
  .use(middleware.auth({ guards: ['api'] }))
  .prefix('web')
  .use(apiThrottle)

// route for mobile
router
  .group(() => {
    router.get('/test-notif', '#controllers/dashboard_controller.test_notif')
    router.resource('announcement-mobile', '#controllers/masterdata/announcement_controller')
    router.resource('bug-mobile', '#controllers/configs/bug_controller')
    // API FOR MOBILE APPLICATIONS
    router.get(
      'attendance-mobile',
      '#controllers/administrations/attendances_controller.listMobile'
    )
    router.get(
      'attendance-mobile-auth-current-date',
      '#controllers/administrations/attendances_controller.currentDate'
    )
    router.get(
      'attendance-mobile-auth-current-shift',
      '#controllers/administrations/attendances_controller.currentShift'
    )
    router.get(
      'attendance-mobile-revision/:date',
      '#controllers/administrations/attendances_controller.revisionGet'
    )
    router.get('users-mobile', '#controllers/masterdata/users_controller.ListMobile')
    router.resource('notification-mobile', '#controllers/configs/notification_controller')
    router.put(
      'notification/:id/:tablename',
      '#controllers/configs/notification_controller.approval'
    )
    router.resource('koreksi-absen-mobile', '#controllers/administrations/koreksi_absen_controller')
    router.resource(
      'perubahan-shift-mobile',
      '#controllers/administrations/perubahan_shifts_controller'
    )
    router.resource('work-overtime-mobile', '#controllers/administrations/work_overtime_controller')
    router.resource('cuti-mobile', '#controllers/administrations/cuti_controller')
  })
  .use(
    middleware.auth({
      guards: ['api'],
    })
  )
  .prefix('mobile')
  .use(apiThrottle)
