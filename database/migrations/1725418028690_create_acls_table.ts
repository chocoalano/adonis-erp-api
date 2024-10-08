import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableRole = 'roles'
  protected tablePermissionGroup = 'permission_groups'
  protected tablePermission = 'permissions'
  protected tableUserHasRoles = 'user_has_roles'
  protected tableRoleHasPermissions = 'role_has_permissions'

  async up() {
    this.schema.createTable(this.tableRole, (table) => {
      table.increments('id')
      table.string('name').notNullable().unique()
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
    this.schema.createTable(this.tablePermissionGroup, (table) => {
      table.increments('id')
      table.string('name').notNullable().unique()
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
    this.schema.createTable(this.tablePermission, (table) => {
      table.increments('id')
      table.string('name').notNullable().unique()
      table.enum('action', ['view', 'create', 'update', 'delete']).notNullable()
      table
        .integer('permission_group_id')
        .unsigned()
        .references('permission_groups.id')
        .onDelete('CASCADE')
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
    this.schema.createTable(this.tableUserHasRoles, (table) => {
      table.bigIncrements('id') // Sesuaikan tipe data dengan kolom yang direferensikan jika perlu
      table.bigInteger('user_id').unsigned().references('users.id').onDelete('CASCADE')
      table.integer('role_id').unsigned().references('roles.id').onDelete('CASCADE')
      table.unique(['user_id', 'role_id'])
      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(this.now())
    })
    this.schema.createTable(this.tableRoleHasPermissions, (table) => {
      table.increments('id')
      table.integer('role_id').unsigned().references('roles.id')
      table.integer('permission_id').unsigned().references('permissions.id')
      table.unique(['role_id', 'permission_id'])
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableRole)
    this.schema.dropTable(this.tablePermissionGroup)
    this.schema.dropTable(this.tablePermission)
    this.schema.dropTable(this.tableUserHasRoles)
    this.schema.dropTable(this.tableRoleHasPermissions)
  }
}
