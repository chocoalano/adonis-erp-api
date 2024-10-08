import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'bug_reports'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.bigInteger('created_by').unsigned().references('users.id').onDelete('CASCADE')
      table.string('picture_proof')
      table.text('descriptions', 'longtext')
      table.boolean('repair_status').defaultTo(false)
      table.integer('repair_progres').defaultTo(0)
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
