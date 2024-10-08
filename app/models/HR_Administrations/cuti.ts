import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from '#models/user'

export default class Cuti extends BaseModel {
  static table = 'cutis'
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column.date()
  declare startDate: DateTime

  @column.date()
  declare endDate: DateTime

  @column()
  declare startTime: string

  @column()
  declare endTime: string

  @column()
  declare category: string

  @column()
  declare type: string

  @column()
  declare description: string

  @column()
  declare userApproved: string

  @column()
  declare userLine: number

  @column()
  declare lineApproved: string

  @column()
  declare userHr: number

  @column()
  declare hrgaApproved: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => User, {
    localKey: 'id',
    foreignKey: 'userId',
  })
  declare user: BelongsTo<typeof User>
  @belongsTo(() => User, {
    localKey: 'id',
    foreignKey: 'userLine',
  })
  declare line: BelongsTo<typeof User>
  @belongsTo(() => User, {
    localKey: 'id',
    foreignKey: 'userHr',
  })
  declare hrga: BelongsTo<typeof User>
}
