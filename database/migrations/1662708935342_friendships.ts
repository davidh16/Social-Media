import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'friendships'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('friendship_id').primary()
      table.integer('user_id').references('users.id').onDelete('CASCADE')
      table.integer('friend_id').references('users.id').onDelete('CASCADE')
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
