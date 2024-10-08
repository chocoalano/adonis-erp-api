import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class UGroupAttendance extends BaseModel {
  static table = 'group_users'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare user_id: number

  @column()
  declare group_attendance_id: number
}
