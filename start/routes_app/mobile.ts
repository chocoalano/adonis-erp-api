import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'
import { apiThrottle } from '../limiter.js'

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

    // Bug reporting routes
    router.post('bug', [BugController, 'store'])

    // Attendance routes
    router
      .group(() => {
        router.get('list', [AttendancesController, 'listMobile'])
        router.post('add', [AttendancesController, 'store'])
        router.get('current-office', [AttendancesController, 'currentOffice'])
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
        router.get('detail/:id', [AnnouncementController, 'show'])
      })
      .prefix('announcement')
  })
  .use(middleware.auth({ guards: ['api'] }))
  .prefix('mobile')
  .use(apiThrottle)
