import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from '#models/user'

export default class Announcement extends BaseModel {
  static table = 'announcements'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare createdBy: number

  @column()
  declare title: string

  @column()
  declare value: string

  // Getter & Setter for Boolean field (publish)
  @column({
    consume: (value: number) => Boolean(value),
    prepare: (value: boolean) => (value ? 1 : 0),
  })
  declare publish: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => User, {
    localKey: 'id',
    foreignKey: 'createdBy',
  })
  declare user_created_by: BelongsTo<typeof User>
}
