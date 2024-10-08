import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from '#models/user'

export default class UFamily extends BaseModel {
  static table = 'u_families'
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column()
  declare fullname: string

  @column()
  declare relationship: string

  @column.date()
  declare birthdate: DateTime

  @column()
  declare maritalStatus: string

  @column()
  declare job: string

  @column.dateTime({ autoCreate: true, serializeAs: null })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, serializeAs: null })
  declare updatedAt: DateTime

  // relationship
  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>
}
