import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import User from '#models/user'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

export default class UAddress extends BaseModel {
  static table = 'u_addres'
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column()
  declare idtype: string

  @column()
  declare idnumber: string

  @column.date()
  declare idexpired: DateTime

  @column()
  declare ispermanent: boolean

  @column()
  declare postalcode: string

  @column()
  declare citizenIdAddress: string

  @column()
  declare useAsResidential: boolean

  @column()
  declare residentialAddress: string

  @column.dateTime({ autoCreate: true, serializeAs: null })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, serializeAs: null })
  declare updatedAt: DateTime

  // relationship
  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>
}
