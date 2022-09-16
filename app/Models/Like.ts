import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, BelongsTo } from '@ioc:Adonis/Lucid/Orm'
import User from './User'

export default class Like extends BaseModel {
  @column({ isPrimary: true })
  public likeId: number

  @column()
  public userId:number

  @column()
  public postId:number

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @belongsTo(() => User, {foreignKey: 'userId'})
  public likedby: BelongsTo<typeof User>
}
