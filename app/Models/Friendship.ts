import { BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'

import User from 'App/Models/User'

export default class Friendship extends BaseModel {
  @column({ isPrimary: true })
  public friendshipId: number

  @column()
  public userId: number

  @column()
  public friendId: number

  @belongsTo(() => User, {foreignKey: 'friendId'})
  public friend: BelongsTo<typeof User>

}
