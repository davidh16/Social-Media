import { DateTime } from 'luxon'
import { BaseModel, column, hasMany, HasMany } from '@ioc:Adonis/Lucid/Orm'
import Friendship from './Friendship'
import Post from './Post'

export default class User extends BaseModel {
  @hasMany(() => Friendship)
  public friendships: HasMany<typeof Friendship>

  @hasMany(() => Post)
  public posts: HasMany<typeof Post>

  @column({ isPrimary: true })
  public id: number

  @column()
  public name: string

  @column()
  public surname: string

  @column()
  public email: string

  @column()
  public password: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
