import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'koreksi_absens'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.bigInteger('user_id').unsigned().references('users.id').onDelete('CASCADE')
      table.date('date_adjustment')
      table.time('timein_adjustment')
      table.time('timeout_adjustment')
      table.text('notes', 'longtext')
      table.enum('status', ['y', 'n', 'w']).defaultTo('w').collate('utf8mb4_unicode_ci')
      table.bigInteger('line_id').unsigned().references('users.id').onDelete('CASCADE')
      table.enum('line_approve', ['y', 'n', 'w']).defaultTo('w').collate('utf8mb4_unicode_ci')
      table.bigInteger('hr_id').unsigned().references('users.id').onDelete('CASCADE')
      table.enum('hr_approve', ['y', 'n', 'w']).defaultTo('w').collate('utf8mb4_unicode_ci')
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
