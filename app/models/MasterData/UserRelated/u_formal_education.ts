import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import User from '#models/user'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

export default class UFormalEducation extends BaseModel {
  static table = 'u_formal_education'
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column()
  declare institution: string

  @column()
  declare majors: string

  @column()
  declare score: number

  @column.date()
  declare start: DateTime

  @column.date()
  declare finish: DateTime

  @column()
  declare description: string

  @column()
  declare certification: boolean

  @column.dateTime({ autoCreate: true, serializeAs: null })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, serializeAs: null })
  declare updatedAt: DateTime

  // relationship
  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>
}
