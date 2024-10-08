import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from '#models/user'
import Organization from '#models/MasterData/Configs/organization'
import JobPosition from '#models/MasterData/Configs/job_position'

export default class WorkOvertime extends BaseModel {
  static table = 'work_overtime'
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare useridCreated: number

  @column.date()
  declare dateSpl: DateTime

  @column()
  declare organizationId: number

  @column()
  declare jobPositionId: number

  @column()
  declare overtimeDayStatus: boolean

  @column.date()
  declare dateOvertimeAt: DateTime

  @column()
  declare userAdm: number

  @column()
  declare adminApproved: string

  @column()
  declare userLine: number

  @column()
  declare lineApproved: string

  @column()
  declare userGm: number

  @column()
  declare gmApproved: string

  @column()
  declare userHr: number

  @column()
  declare hrgaApproved: string

  @column()
  declare userDirector: number

  @column()
  declare directorApproved: string

  @column()
  declare userFat: number

  @column()
  declare fatApproved: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => User, {
    localKey: 'id',
    foreignKey: 'useridCreated',
  })
  declare user: BelongsTo<typeof User>

  @belongsTo(() => Organization, {
    localKey: 'id',
    foreignKey: 'organizationId',
  })
  declare org: BelongsTo<typeof Organization>

  @belongsTo(() => JobPosition, {
    localKey: 'id',
    foreignKey: 'jobPositionId',
  })
  declare position: BelongsTo<typeof JobPosition>
}
