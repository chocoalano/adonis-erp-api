import { DateTime } from 'luxon'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import User from '#models/user'

export default class UInformalEducation extends BaseModel {
  static table = 'u_informal_education'
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column()
  declare name: string

  @column.date()
  declare start: DateTime

  @column.date()
  declare finish: DateTime

  @column.date()
  declare expired: DateTime

  @column()
  declare type: string

  @column()
  declare duration: number

  @column()
  declare fee: number

  @column()
  declare description: string

  @column()
  declare certification: boolean

  @column.dateTime({ autoCreate: true, serializeAs: null })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, serializeAs: null })
  declare updatedAt: DateTime | null

  // relationship
  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>
}
