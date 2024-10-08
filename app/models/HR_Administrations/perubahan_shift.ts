import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import User from '#models/user'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import GroupAttendance from './group_attendance.js'
import TimeAttendance from '#models/MasterData/Configs/time_attendance'

export default class PerubahanShift extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column.date()
  declare date: DateTime

  @column()
  declare currentGroup: number

  @column()
  declare currentShift: number

  @column()
  declare adjustShift: number

  @column()
  declare status: string

  @column()
  declare lineId: number

  @column()
  declare lineApprove: string

  @column()
  declare hrId: number

  @column()
  declare hrApprove: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => User, {
    localKey: 'id',
    foreignKey: 'userId',
  })
  declare user: BelongsTo<typeof User>

  @belongsTo(() => GroupAttendance, {
    localKey: 'id',
    foreignKey: 'currentGroup',
  })
  declare group: BelongsTo<typeof GroupAttendance>

  @belongsTo(() => TimeAttendance, {
    localKey: 'id',
    foreignKey: 'currentShift',
  })
  declare currentshift: BelongsTo<typeof TimeAttendance>

  @belongsTo(() => TimeAttendance, {
    localKey: 'id',
    foreignKey: 'adjustShift',
  })
  declare adjustshift: BelongsTo<typeof TimeAttendance>

  @belongsTo(() => User, {
    localKey: 'id',
    foreignKey: 'lineId',
  })
  declare line: BelongsTo<typeof User>

  @belongsTo(() => User, {
    localKey: 'id',
    foreignKey: 'hrId',
  })
  declare hr: BelongsTo<typeof User>
}
