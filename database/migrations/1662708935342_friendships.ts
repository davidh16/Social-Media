import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'friendships'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('friendshipId').primary()
      table.integer('userId').references('users.id').onDelete('CASCADE')
      table.integer('friendId').references('users.id').onDelete('CASCADE')
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
