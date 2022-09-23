import { DateTime } from 'luxon'
import { BaseModel, column, manyToMany, ManyToMany, belongsTo, BelongsTo} from '@ioc:Adonis/Lucid/Orm'
import User from 'App/Models/User'

export default class Post extends BaseModel {
  @manyToMany(() => User,{
    pivotTable:'likes',
    localKey:'id',
    relatedKey:"id",
    pivotForeignKey:'post_id',
    pivotRelatedForeignKey:'user_id'
  })
  public likes: ManyToMany<typeof User>

  @belongsTo(()=> User)
  public owner:BelongsTo<typeof User>

  @column({ isPrimary: true })
  public id: number

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
}
