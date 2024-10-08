import { DateTime } from 'luxon'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { column, BaseModel, belongsTo } from '@adonisjs/lucid/orm'
import User from '#models/user'

export default class UWorkExperience extends BaseModel {
  static table = 'u_work_experiences'
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column()
  declare company: string

  @column()
  declare position: string

  @column.date()
  declare from: DateTime

  @column.date()
  declare to: DateTime

  @column()
  declare lengthOfService: number

  @column.dateTime({ autoCreate: true, serializeAs: null })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, serializeAs: null })
  declare updatedAt: DateTime

  // relationship
  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>
}
