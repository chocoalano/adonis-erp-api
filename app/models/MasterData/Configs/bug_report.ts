import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from '#models/user'

export default class BugReport extends BaseModel {
  @column({ isPrimary: true })
  declare id: number
  @column()
  declare createdBy: number
  @column()
  declare pictureProof: string
  @column()
  declare descriptions: string
  @column({
    consume: (value: number) => Boolean(value),
    prepare: (value: boolean) => (value ? 1 : 0),
  })
  declare repairStatus: boolean
  @column()
  declare repairProgres: number

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
