import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'
import { apiThrottle } from './limiter.js'
import { sep, normalize } from 'node:path'
import app from '@adonisjs/core/services/app'

router.get('/', () => {
  return 'Hello world from the home page.'
})

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

// ROUTE WEB APPS::STARTED
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
// ROUTE WEB APPS::ENDED
// =========================================================================
// ROUTE MOBILE APPS::STARTED
const UsersController = () => import('#controllers/mobile_services/masterdata/users_controller')
const BugController = () => import('#controllers/mobile_services/configs/bug_controller')
const AttendancesController = () =>
  import('#controllers/mobile_services/administrations/attendances_controller')
const AnnouncementController = () =>
  import('#controllers/web_sevices/masterdata/announcement_controller')
const NotificationController = () =>
  import('#controllers/mobile_services/configs/notification_controller')
const KoreksiAbsenController = () =>
  import('#controllers/mobile_services/administrations/koreksi_absen_controller')
const PerubahanShiftsController = () =>
  import('#controllers/mobile_services/administrations/perubahan_shifts_controller')
const WorkOvertimeController = () =>
  import('#controllers/mobile_services/administrations/work_overtime_controller')
const CutiController = () => import('#controllers/mobile_services/administrations/cuti_controller')

router
  .group(() => {
    router.get('/test-notif', '#controllers/dashboard_controller.test_notif')

    // User routes
    router.get('users', [UsersController, 'index'])
    // BUGS reporting routes
    router.post('bug', [BugController, 'store'])
    // Attendance routes
    router
      .group(() => {
        router.get('list', [AttendancesController, 'listMobile'])
        router.post('add', [AttendancesController, 'store'])
        router.get('current-date', [AttendancesController, 'currentDate'])
        router.get('current-shift', [AttendancesController, 'currentShift'])
        router.get('revision/:date', [AttendancesController, 'revisionGet'])
      })
      .prefix('attendance')
    // Notification routes
    router
      .group(() => {
        router.get('list', [NotificationController, 'index'])
        router.put('approval/:id/:tablename', [NotificationController, 'approval'])
        router.get('show/:id', [NotificationController, 'show'])
      })
      .prefix('notification')
    // Koreksi Absen routes
    router
      .group(() => {
        router.get('list', [KoreksiAbsenController, 'index'])
        router.post('add', [KoreksiAbsenController, 'store'])
        router.put('approve/:id', [KoreksiAbsenController, 'update'])
      })
      .prefix('koreksi-absensi')
    // Perubahan Shift routes
    router
      .group(() => {
        router.get('list', [PerubahanShiftsController, 'index'])
        router.post('add', [PerubahanShiftsController, 'store'])
        router.put('approve/:id', [PerubahanShiftsController, 'update'])
      })
      .prefix('perubahan-shift')
    // Work Overtime routes
    router
      .group(() => {
        router.get('list', [WorkOvertimeController, 'index'])
        router.post('add', [WorkOvertimeController, 'store'])
        router.put('approve/:id', [WorkOvertimeController, 'update'])
      })
      .prefix('lembur')
    // Cuti routes
    router
      .group(() => {
        router.get('list', [CutiController, 'index'])
        router.post('add', [CutiController, 'store'])
        router.put('approve/:id', [CutiController, 'update'])
      })
      .prefix('cuti')
    // Announcement routes
    router
      .group(() => {
        router.get('list', [AnnouncementController, 'index'])
        router.put('detail/:id', [AnnouncementController, 'show'])
      })
      .prefix('announcement')
  })
  .use(middleware.auth({ guards: ['api'] }))
  .prefix('mobile')
  .use(apiThrottle)
// ROUTE MOBILE APPS::ENDED
