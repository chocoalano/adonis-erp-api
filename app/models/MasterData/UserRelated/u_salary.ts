import { DateTime } from 'luxon'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import User from '#models/user'

export default class USalary extends BaseModel {
  static table = 'u_salaries'
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column()
  declare basicSalary: number

  @column()
  declare salaryType: string

  @column()
  declare paymentSchedule: string

  @column()
  declare prorateSettings: string

  @column()
  declare overtimeSettings: string

  @column()
  declare costCenter: string

  @column()
  declare costCenterCategory: string

  @column()
  declare currency: string

  @column.dateTime({ autoCreate: true, serializeAs: null })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, serializeAs: null })
  declare updatedAt: DateTime

  // relationship
  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>
}
