import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import User from './user.js'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

export default class NotificationView extends BaseModel {
  static table = 'notification_view'
  @column()
  declare tablename: string
  @column()
  declare id: number
  @column()
  declare userCreated: number
  @column()
  declare user_1: number
  @column()
  declare user_2: number
  @column()
  declare user_3: number
  @column()
  declare user_4: number
  @column()
  declare user_5: number
  @column()
  declare user_6: number
  @column()
  declare status_1: string
  @column()
  declare status_2: string
  @column()
  declare status_3: string
  @column()
  declare status_4: string
  @column()
  declare status_5: string
  @column()
  declare status_6: string

  @belongsTo(() => User, {
    localKey: 'id',
    foreignKey: 'userCreated',
  })
  declare user: BelongsTo<typeof User>
}
