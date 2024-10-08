import { DateTime } from 'luxon'
import { BaseModel, column, hasMany, manyToMany } from '@adonisjs/lucid/orm'
import ScheduleGroupAttendance from './schedule_group_attendance.js'
import type { HasMany, ManyToMany } from '@adonisjs/lucid/types/relations'
import User from '#models/user'
import GroupUser from './group_user.js'

export default class GroupAttendance extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column()
  declare description: string

  @column()
  declare patternName: string

  @column.dateTime({ autoCreate: true, serializeAs: null })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, serializeAs: null })
  declare updatedAt: DateTime

  @hasMany(() => ScheduleGroupAttendance, {
    localKey: 'id',
    foreignKey: 'group_attendance_id',
  })
  declare schedule_attendance: HasMany<typeof ScheduleGroupAttendance>

  @hasMany(() => GroupUser, {
    localKey: 'id',
    foreignKey: 'groupAttendanceId',
  })
  declare group_users_id: HasMany<typeof GroupUser>

  @manyToMany(() => User, {
    localKey: 'id',
    pivotForeignKey: 'group_attendance_id',
    relatedKey: 'id',
    pivotRelatedForeignKey: 'user_id',
    pivotTable: 'group_users',
  })
  declare group_users: ManyToMany<typeof User>
}
