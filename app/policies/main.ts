/*
|--------------------------------------------------------------------------
| Bouncer policies
|--------------------------------------------------------------------------
|
| You may define a collection of policies inside this file and pre-register
| them when creating a new bouncer instance.
|
| Pre-registered policies and abilities can be referenced as a string by their
| name. Also they are must if want to perform authorization inside Edge
| templates.
|
*/

export const policies = {
  TimePolicy: () => import('#policies/MasterData/Configs/time_policy'),
  RolePolicy: () => import('#policies/MasterData/Configs/role_policy'),
  PermissionPolicy: () => import('#policies/MasterData/Configs/permission_policy'),
  OrganizationPolicy: () => import('#policies/MasterData/Configs/organization_policy'),
  JobPositionPolicy: () => import('#policies/MasterData/Configs/job_position_policy'),
  JobLevelPolicy: () => import('#policies/MasterData/Configs/job_level_policy'),
  CompanyPolicy: () => import('#policies/MasterData/Configs/company_policy'),
  BrancePolicy: () => import('#policies/MasterData/Configs/brance_policy'),
  AttendancePolicy: () => import('#policies/MasterData/HR_Administrations/attendance_policy'),
  UserPolicy: () => import('#policies/MasterData/user_policy'),
  LemburPolicy: () => import('#policies/MasterData/HR_Administrations/lembur_policy'),
  CutiPolicy: () => import('#policies/MasterData/HR_Administrations/cuti_policy'),
  PerubahanShiftPolicy: () =>
    import('#policies/MasterData/HR_Administrations/perubahan_shift_policy'),
  KoreksiAbsenPolicy: () => import('#policies/MasterData/HR_Administrations/koreksi_absen_policy'),
  BugPolicy: () => import('#policies/MasterData/Configs/bug_policy'),
  AnnouncementPolicy: () => import('#policies/MasterData/announcement_policy'),
}
