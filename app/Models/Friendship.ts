import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class Friendship extends BaseModel {
  @column({ isPrimary: true })
  public friendship_id: number

  @column()
  public user_id: number

  @column()
  public friend_id: number

}
