import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, BelongsTo, hasMany, HasMany } from '@ioc:Adonis/Lucid/Orm'
import User from 'App/Models/User'
import Like from './Like'

export default class Post extends BaseModel {
  @hasMany(() => Like)
  public likes: HasMany<typeof Like>

  @column({ isPrimary: true })
  public postId: number

  @column()
  public userId: number

  @column()
  public numberOfLikes: number

  @column()
  public description: string

  @column()
  public image: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @belongsTo(() => User)
  public author: BelongsTo<typeof User>
}
