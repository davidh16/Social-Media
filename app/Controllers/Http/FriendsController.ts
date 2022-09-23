import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'

export default class FriendsController {
    public async addFriend({ user, params, response }) {
        const addedUser = await User.findByOrFail('id', params.friend_id)
        const temp = await user.related('followers').query()
        const friendsList = temp.map((item) => {
            return item.email
        })
        if (friendsList.includes(addedUser.email) || user.id === addedUser.id){
            return response.forbidden('User is either you or already your friend')
        }
        if(addedUser.verified === false){
            return response.notFound('User not found')
        }
        await user.related('followers').attach([addedUser.id])
        return response.ok(`${addedUser.name} has been added as a friend`)
    }

    public async deleteFriend({ user, response, params }: HttpContextContract){
        const friend = await User.findByOrFail('id', params.friend_id)
        const temp = await user.related('followers').query()
        const friendsList = temp.map((item) => {
            return item.email
        })
        if (friendsList.includes(friend.email)){
            await user.related('followers').detach([friend.id])
            return response.ok("Friend deleted")
        }
        return response.notFound('Friend not found')
    }

    public async getFriend({response, params, user}:HttpContextContract){
        const friend = await User.query().where('id', user.id).preload('followers',(builder) => {
            builder.where('id', params.friend_id)
        })
        return response.ok(friend)
        } //probaj s following
        
    public async getFriendsList({user, response, request}:HttpContextContract){
        const page = request.input('page',1)
        const limit = request.input('limit',5)

        const friendsList = await User.query().whereHas('following', (builder) => {
            builder.where('user_id', user.id)
        }).paginate(page,limit) //probaj preload umjesto whereHas

        if(friendsList){
            return response.ok(friendsList)
        }
        return response.notFound('No friends found')
    } // uz listu prijatelja nisam uspio dobiti usera čiji su prijatelji
}
