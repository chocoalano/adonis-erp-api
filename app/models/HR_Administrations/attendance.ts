import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from '#models/user'

export default class Attendance extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare nik: string
  @column()
  declare schedule_group_attendances_id: number
  @column.date()
  declare date: DateTime
  @column()
  declare lat_in: number
  @column()
  declare lng_in: number
  @column()
  declare time_in: string
  @column()
  declare photo_in: string
  @column()
  declare status_in: string
  @column()
  declare lat_out: number
  @column()
  declare lng_out: number
  @column()
  declare time_out: string
  @column()
  declare photo_out: string
  @column()
  declare status_out: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => User, {
    localKey: 'nik',
    foreignKey: 'nik',
  })
  declare user: BelongsTo<typeof User>
}
