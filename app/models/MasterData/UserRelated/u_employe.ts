import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column, hasOne } from '@adonisjs/lucid/orm'
import User from '#models/user'
import type { BelongsTo, HasOne } from '@adonisjs/lucid/types/relations'
import Organization from '../Configs/organization.js'
import JobPosition from '../Configs/job_position.js'
import JobLevel from '../Configs/job_levels.js'
import Company from '../Configs/company.js'
import Branch from '../Configs/brance.js'

export default class UEmploye extends BaseModel {
  static table = 'u_employes'
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column()
  declare organizationId: number

  @column()
  declare jobPositionId: number

  @column()
  declare jobLevelId: number

  @column()
  declare approvalLine: number

  @column()
  declare approvalManager: number

  @column()
  declare companyId: number

  @column()
  declare branchId: number

  @column()
  declare status: string

  @column.date()
  declare joinDate: DateTime

  @column.date()
  declare signDate: DateTime

  @column.dateTime({ autoCreate: true, serializeAs: null })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, serializeAs: null })
  declare updatedAt: DateTime

  // relationship
  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>
  @hasOne(() => Organization, {
    foreignKey: 'id',
    localKey: 'organizationId',
  })
  declare org: HasOne<typeof JobPosition>
  @hasOne(() => JobPosition, {
    foreignKey: 'id',
    localKey: 'jobPositionId',
  })
  declare job: HasOne<typeof JobPosition>
  @hasOne(() => JobLevel, {
    foreignKey: 'id',
    localKey: 'jobLevelId',
  })
  declare lvl: HasOne<typeof JobLevel>
  @hasOne(() => User, {
    foreignKey: 'id',
    localKey: 'approvalLine',
  })
  declare appline: HasOne<typeof User>
  @hasOne(() => User, {
    foreignKey: 'id',
    localKey: 'approvalManager',
  })
  declare appmngr: HasOne<typeof User>
  @hasOne(() => Company, {
    foreignKey: 'id',
    localKey: 'companyId',
  })
  declare company: HasOne<typeof Company>
  @hasOne(() => Branch, {
    foreignKey: 'id',
    localKey: 'branchId',
  })
  declare branch: HasOne<typeof Branch>
}
