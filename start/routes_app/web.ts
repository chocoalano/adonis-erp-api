import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'
import { apiThrottle } from '../limiter.js'
const NotificationController = () =>
  import('#controllers/web_sevices/configs/notification_controller')
const KoreksiAbsenController = () =>
  import('#controllers/web_sevices/administrations/koreksi_absen_controller')
const CutiController = () => import('#controllers/web_sevices/administrations/cuti_controller')
const PerubahanShiftsController = () =>
  import('#controllers/web_sevices/administrations/perubahan_shifts_controller')
const WorkOvertimeController = () =>
  import('#controllers/mobile_services/administrations/work_overtime_controller')
const ScheduleGroupAbsensController = () =>
  import('#controllers/web_sevices/administrations/schedule_group_absens_controller')
const CompaniesController = () => import('#controllers/web_sevices/configs/companies_controller')
const BugController = () => import('#controllers/web_sevices/configs/bug_controller')
const BranchesController = () => import('#controllers/web_sevices/configs/branches_controller')
const LevelsController = () => import('#controllers/web_sevices/configs/levels_controller')
const OrganizationsController = () =>
  import('#controllers/web_sevices/configs/organizations_controller')
const JobsController = () => import('#controllers/web_sevices/configs/jobs_controller')
const TimeConfigsController = () =>
  import('#controllers/web_sevices/configs/time_configs_controller')
const GroupAbsensController = () =>
  import('#controllers/web_sevices/administrations/group_absens_controller')
const DashboardController = () => import('#controllers/web_sevices/dashboard_controller')
const RoleController = () => import('#controllers/web_sevices/configs/role_controller')
const UsersController = () => import('#controllers/web_sevices/masterdata/users_controller')
const AnnouncementController = () =>
  import('#controllers/web_sevices/masterdata/announcement_controller')
const AttendancesController = () =>
  import('#controllers/web_sevices/administrations/attendances_controller')

router
  .group(() => {
    router.get('dashboard', [DashboardController, 'index'])
    router.resource('role', RoleController)
    router.resource('users', UsersController)
    router.get('users-kelengkapan-form', [UsersController, 'kelengkapan_form'])
    router.resource('announcement', AnnouncementController)
    router.resource('attendance', AttendancesController)
    router.resource('company', CompaniesController)
    router.resource('bug', BugController)
    router.resource('branch', BranchesController)
    router.resource('level', LevelsController)
    router.resource('dept', OrganizationsController)
    router.resource('job', JobsController)
    router.resource('time', TimeConfigsController)
    router.resource('attendance-group', GroupAbsensController)
    router.resource('attendance-group-schedule', ScheduleGroupAbsensController)
    router.resource('work-overtime', WorkOvertimeController)
    router.resource('cuti', CutiController)
    router.resource('perubahan-shift', PerubahanShiftsController)
    router.resource('koreksi-absen', KoreksiAbsenController)
    router.get('time-all', [TimeConfigsController, 'showAll'])
    router.resource('notification', NotificationController)
  })
  .use(middleware.auth({ guards: ['api'] }))
  .prefix('web')
  .use(apiThrottle)
