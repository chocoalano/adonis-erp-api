import { BaseModel, column } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'

export default class Company extends BaseModel {
  static table = 'companies'
  @column({ isPrimary: true })
  declare id: number
  @column()
  declare name: string
  @column()
  declare latitude: string
  @column()
  declare longitude: string
  @column()
  declare fullAddress: string
  @column.dateTime({ autoCreate: true, serializeAs: null })
  declare createdAt: DateTime
  @column.dateTime({ autoCreate: true, autoUpdate: true, serializeAs: null })
  declare updatedAt: DateTime
  @column.dateTime({ autoCreate: false, autoUpdate: false, serializeAs: null })
  declare deletedAt: DateTime
}
