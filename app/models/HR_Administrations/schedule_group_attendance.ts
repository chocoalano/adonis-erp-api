import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import User from '#models/user'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import TimeAttendance from '../MasterData/Configs/time_attendance.js'
import GroupAttendance from './group_attendance.js'
import UGroupAttendance from '../MasterData/UserRelated/u_group_attendance.js'

export default class ScheduleGroupAttendance extends BaseModel {
  @column({ isPrimary: true })
  declare id: number
  @column()
  declare group_attendance_id: number
  @column()
  declare user_id: number
  @column()
  declare time_attendance_id: number
  @column.date()
  declare date: DateTime
  @column()
  declare status: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  // relationship
  @belongsTo(() => User, {
    localKey: 'id',
    foreignKey: 'user_id',
  })
  declare user: BelongsTo<typeof User>

  @belongsTo(() => TimeAttendance, {
    localKey: 'id',
    foreignKey: 'time_attendance_id',
  })
  declare time: BelongsTo<typeof TimeAttendance>

  @belongsTo(() => GroupAttendance, {
    localKey: 'id',
    foreignKey: 'group_attendance_id',
  })
  declare group_attendance: BelongsTo<typeof GroupAttendance>

  @belongsTo(() => UGroupAttendance, {
    localKey: 'group_attendance_id',
    foreignKey: 'group_attendance_id',
  })
  declare group_user_attendance: BelongsTo<typeof UGroupAttendance>
}
