import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class Friendship extends BaseModel {
  @column({ isPrimary: true })
  public friendshipId: number

  @column()
  public userId: number

  @column()
  public friendId: number

}
