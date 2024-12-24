import { BaseModel, column } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'

export default class ViewCurrentShiftNow extends BaseModel {
  static table = 'view_current_shift_now'

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
  @column()
  declare time_id: number
  @column()
  declare time_type: string
  @column()
  declare time_in: string
  @column()
  declare time_out: string
  @column()
  declare time_pattern: string
  @column()
  declare group_name: string
  @column()
  declare group_pattern: string
  @column()
  declare user_idprimary: number
  @column()
  declare user_name: string
  @column()
  declare user_nik: number
  @column()
  declare user_email: string
  @column()
  declare user_phone: string
  @column()
  declare user_gender: string
}
