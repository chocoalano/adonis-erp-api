import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import User from './user.js'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

export default class Notification extends BaseModel {
  @column({ isPrimary: true })
  declare id: number
  @column()
  declare from: number
  @column()
  declare to: number
  @column()
  declare isread: string
  @column()
  declare type: string
  @column()
  declare title: string
  @column()
  declare message: string
  @column()
  declare payload: object

  @belongsTo(() => User, {
    localKey: 'id',
    foreignKey: 'from',
  })
  declare fromUser: BelongsTo<typeof User>
  @belongsTo(() => User, {
    localKey: 'id',
    foreignKey: 'to',
  })
  declare toUser: BelongsTo<typeof User>
}
