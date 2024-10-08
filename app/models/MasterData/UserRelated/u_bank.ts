import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import User from '#models/user'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

export default class UBank extends BaseModel {
  static table = 'u_banks'
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column()
  declare bankName: string

  @column()
  declare bankAccount: string

  @column()
  declare bankAccountHolder: string

  @column.dateTime({ autoCreate: true, serializeAs: null })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, serializeAs: null })
  declare updatedAt: DateTime

  // relationship
  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>
}
