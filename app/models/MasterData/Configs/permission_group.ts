import { DateTime } from 'luxon'
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import Permission from './permission.js'
import type { HasMany } from '@adonisjs/lucid/types/relations'

export default class PermissionGroup extends BaseModel {
  static table = 'permission_groups'
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @hasMany(() => Permission, {
    foreignKey: 'permission_group_id',
  })
  declare childPermission: HasMany<typeof Permission>
}
