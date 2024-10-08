import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class TimeAttendance extends BaseModel {
  @column({ isPrimary: true })
  declare id: number
  @column()
  declare type: string;
  @column()
  declare in: string
  @column()
  declare out: string
  @column()
  declare patternName: string
  @column()
  declare rules: number | null

  @column.dateTime({ autoCreate: true, serializeAs: null })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, serializeAs: null })
  declare updatedAt: DateTime
}
