import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from '#models/user'

export default class KoreksiAbsen extends BaseModel {
  @column({ isPrimary: true })
  declare id: number
  @column()
  declare userId: number
  @column.date()
  declare dateAdjustment: DateTime
  @column()
  declare timeinAdjustment: string
  @column()
  declare timeoutAdjustment: string
  @column()
  declare notes: string
  @column()
  declare status: string
  @column()
  declare lineId: number
  @column()
  declare lineApprove: string
  @column()
  declare hrId: number
  @column()
  declare hrApprove: string

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
    foreignKey: 'lineId',
  })
  declare line: BelongsTo<typeof User>

  @belongsTo(() => User, {
    localKey: 'id',
    foreignKey: 'hrId',
  })
  declare hrd: BelongsTo<typeof User>
}
