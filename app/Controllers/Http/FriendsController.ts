import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'

export default class FriendsController {
    public async addFriend({ user, params, response }) {
        const addedUser = await User.findByOrFail('id', params.friend_id)
        const temp = await user.related('friends').query()
        const friendsList = temp.map((item) => {
            return item.email
        })
        if (friendsList.includes(addedUser.email) || user.id === addedUser.id){
            return response.forbidden()
        }
        if(addedUser.validated === false){
            return response.notFound()
        }
        await user.related('friends').attach([addedUser.id])
        return response.ok(`${addedUser.name} has been added as a friend`)
    }

    public async deleteFriend({ user, response, params }: HttpContextContract){
        const friend = await User.findByOrFail('id', params.friend_id)
        const temp = await user.related('friends').query()
        const friendsList = temp.map((item) => {
            return item.email
        })
        if (friendsList.includes(friend.email)){
            await user.related('friends').detach([friend.id])
            return response.ok("Friend deleted")
        }
        return response.notFound('Friend not found')
    }

    public async getFriendsList({user}:HttpContextContract){
        const friendsList = await user.related('friends').query()
        return friendsList.map((item) => {
            return {
                name: item.name,
                surname: item.surname,
                email: item.email,
            }
        })
    }
}
