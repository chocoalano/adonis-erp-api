import { DateTime } from 'luxon'
import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import { BaseModel, column, hasMany, hasOne, manyToMany } from '@adonisjs/lucid/orm'
import type { HasMany, HasOne, ManyToMany } from '@adonisjs/lucid/types/relations'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import { DbAccessTokensProvider } from '@adonisjs/auth/access_tokens'
import UAddress from './MasterData/UserRelated/u_address.js'
import UBank from './MasterData/UserRelated/u_bank.js'
import UBpj from './MasterData/UserRelated/u_bpj.js'
import UEmergencyContact from './MasterData/UserRelated/u_emergency_contact.js'
import UFamily from './MasterData/UserRelated/u_family.js'
import UFormalEducation from './MasterData/UserRelated/u_formal_education.js'
import UInformalEducation from './MasterData/UserRelated/u_informal_education.js'
import UWorkExperience from './MasterData/UserRelated/u_work_experience.js'
import UEmploye from './MasterData/UserRelated/u_employe.js'
import USalary from './MasterData/UserRelated/u_salary.js'
import UTaxConfig from './MasterData/UserRelated/u_tax_config.js'
import Role from './MasterData/Configs/role.js'
import ScheduleGroupAttendance from './HR_Administrations/schedule_group_attendance.js'

const AuthFinder = withAuthFinder(() => hash.use('scrypt'), {
  uids: ['email'],
  passwordColumnName: 'password',
})

export default class User extends compose(BaseModel, AuthFinder) {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string | null

  @column()
  declare nik: number

  @column()
  declare email: string

  @column()
  declare password: string

  @column()
  declare phone: string

  @column()
  declare placebirth: string

  @column.date()
  declare datebirth: DateTime

  @column()
  declare gender: string

  @column()
  declare blood: string

  @column()
  declare maritalStatus: string

  @column()
  declare religion: string

  @column()
  declare image: string

  @column.dateTime({ autoCreate: true, serializeAs: null })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, serializeAs: null })
  declare updatedAt: DateTime | null

  @column.dateTime({ autoCreate: false, autoUpdate: false, serializeAs: null })
  declare deletedAt: DateTime | null

  // @beforeSave()
  // static async hashPassword(user: User) {
  //   if (user.$dirty.password) {
  //     user.password = await hash.make(user.password)
  //   }
  // }

  static accessTokens = DbAccessTokensProvider.forModel(User, {
    expiresIn: '30 days',
    prefix: 'esas_',
    table: 'auth_access_tokens',
    type: 'auth_token',
    tokenSecretLength: 40,
  })

  // Relationship
  @hasOne(() => UAddress, {
    foreignKey: 'userId',
  })
  declare address: HasOne<typeof UAddress>

  @hasOne(() => UBank, {
    foreignKey: 'userId',
  })
  declare bank: HasOne<typeof UBank>

  @hasOne(() => UBpj, {
    foreignKey: 'userId',
  })
  declare bpjs: HasOne<typeof UBpj>

  @hasMany(() => UEmergencyContact, {
    foreignKey: 'userId',
  })
  declare emergencyContact: HasMany<typeof UEmergencyContact>

  @hasMany(() => UFamily, {
    foreignKey: 'userId',
  })
  declare family: HasMany<typeof UFamily>

  @hasMany(() => UFormalEducation, {
    foreignKey: 'userId',
  })
  declare formalEducation: HasMany<typeof UFormalEducation>

  @hasMany(() => UInformalEducation, {
    foreignKey: 'userId',
  })
  declare informalEducation: HasMany<typeof UInformalEducation>

  @hasMany(() => UWorkExperience, {
    foreignKey: 'userId',
  })
  declare workExperience: HasMany<typeof UWorkExperience>

  @hasMany(() => ScheduleGroupAttendance, {
    foreignKey: 'user_id',
  })
  declare schedule: HasMany<typeof ScheduleGroupAttendance>

  @hasOne(() => UEmploye, {
    onQuery: (query) => {
      query
        .preload('org')
        .preload('job')
        .preload('lvl')
        .preload('appline')
        .preload('appmngr')
        .preload('company')
        .preload('branch')
    },
    foreignKey: 'userId',
  })
  declare employe: HasOne<typeof UEmploye>

  @hasOne(() => USalary, {
    foreignKey: 'userId',
  })
  declare salary: HasOne<typeof USalary>

  @hasOne(() => UTaxConfig, {
    foreignKey: 'userId',
  })
  declare taxConfig: HasOne<typeof UTaxConfig>

  @manyToMany(() => Role, {
    onQuery: (query) => {
      query.preload('permissions')
    },
    localKey: 'id',
    pivotForeignKey: 'user_id',
    relatedKey: 'id',
    pivotRelatedForeignKey: 'role_id',
    pivotTable: 'user_has_roles',
  })
  declare roles: ManyToMany<typeof Role>

  async hasRole(user: User, roleName: string): Promise<boolean> {
    const t = await User.query()
      .where('id', user.id)
      .whereHas('roles', (roleQuery) => {
        roleQuery.where('name', roleName)
      })
      .first()
    return t ? true : false
  }

  async hasPosition(user: User, positionName: string): Promise<boolean> {
    const t = await User.query()
      .where('id', user.id)
      .whereHas('employe', (emp) => {
        emp.whereHas('job', (job) => {
          job.where('name', positionName)
        })
      })
      .first()
    return t ? true : false
  }

  async hasPermission(user: User, permissionName: string) {
    const t = await user
      .related('roles')
      .query()
      .whereHas('permissions', (q) => {
        q.where('name', permissionName)
      })
      .first()
    return t ? true : false
  }
}
