import { BaseModel, column } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'

export default class JobPosition extends BaseModel {
  static table = 'job_positions'
  @column({ isPrimary: true })
  declare id: number
  @column()
  declare name: string
  @column()
  declare description: string
  @column.dateTime({ autoCreate: true, serializeAs: null })
  declare createdAt: DateTime
  @column.dateTime({ autoCreate: true, autoUpdate: true, serializeAs: null })
  declare updatedAt: DateTime
  @column.dateTime({ autoCreate: false, autoUpdate: false, serializeAs: null })
  declare deletedAt: DateTime
}
