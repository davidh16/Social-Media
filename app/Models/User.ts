import { DateTime } from 'luxon'
import { BaseModel, column, hasMany, HasMany, beforeSave, manyToMany, ManyToMany } from '@ioc:Adonis/Lucid/Orm'
import Hash from '@ioc:Adonis/Core/Hash'
import Post from './Post'

export default class User extends BaseModel {
  @manyToMany(() => User,{
    pivotTable:'friendships',
    pivotForeignKey:'user_id',
    pivotRelatedForeignKey:'friend_id'
  })
  public friends: ManyToMany<typeof User>

  @hasMany(()=>Post)
  public posts: HasMany<typeof Post>
  
  @column({ isPrimary: true })
  public id: number

  @column()
  public name: string

  @column()
  public surname: string

  @column({serializeAs:null})
  public email: string

  @column({serializeAs:null})
  public password: string | null

  @column()
  public validated: boolean

  @column()
  public provider: string | null

  @column()
  public providerId: string | null

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @beforeSave()
  public static async hashPassword (user: User) {
    if (user.$dirty.password) {
      user.password = await Hash.make(user.password!)
    }
  }


}
