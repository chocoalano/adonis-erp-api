import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'notifications'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.bigInteger('from').unsigned().references('users.id').onDelete('CASCADE')
      table.bigInteger('to').unsigned().references('users.id').onDelete('CASCADE').nullable()
      table.enum('isread', ['y', 'n']).notNullable().defaultTo('n')
      table.string('type', 100).notNullable()
      table.string('title', 200).notNullable()
      table.text('message', 'longtext').notNullable()
      table.json('payload').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
