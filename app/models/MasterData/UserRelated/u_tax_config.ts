import { DateTime } from 'luxon'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import User from '#models/user'

export default class UTaxConfig extends BaseModel {
  static table = 'u_tax_configs'
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column()
  declare npwp15DigitOld: string

  @column()
  declare npwp16DigitNew: string

  @column()
  declare ptkpStatus: string

  @column()
  declare taxMethod: string

  @column()
  declare taxSalary: number

  @column()
  declare empTaxStatus: string

  @column()
  declare beginningNetto: number

  @column()
  declare pph21_paid: number

  @column.dateTime({ autoCreate: true, serializeAs: null })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, serializeAs: null })
  declare updatedAt: DateTime

  // relationship
  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>
}
