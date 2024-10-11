import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'
import { apiThrottle } from '../limiter.js'
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
