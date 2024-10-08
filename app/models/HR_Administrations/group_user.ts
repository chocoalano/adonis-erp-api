import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import User from '#models/user'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import GroupAttendance from './group_attendance.js'

export default class GroupUser extends BaseModel {
  static table = 'group_users'
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column()
  declare groupAttendanceId: number

  @belongsTo(() => User, {
    localKey: 'id',
    foreignKey: 'userId',
  })
  declare user: BelongsTo<typeof User>

  @belongsTo(() => GroupAttendance, {
    localKey: 'id',
    foreignKey: 'groupAttendanceId',
  })
  declare group: BelongsTo<typeof GroupAttendance>
}
