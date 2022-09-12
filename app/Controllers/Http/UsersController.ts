import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'
import Friendship from 'App/Models/Friendship'

export default class UsersController {
    public async register({ request, response }: HttpContextContract) {
        const new_user = new User()
        new_user.name = request.body().name
        new_user.surname = request.body().surname
        new_user.email = request.body().email
        new_user.password = request.body().password

        await new_user.save()

        return response.status(200)
    }

    public async login({ auth, request, response }: HttpContextContract) {
        const current_user = await User.findByOrFail('email', request.body().email)
        if (current_user.password == request.body().password) {
            const token = await auth.use('api').generate(current_user, {
                expiresIn: '8 hours'
            })
            return token.toJSON()
        }
        else {
            return response.unauthorized('Invalid credentials')
        }
    }

    public async addFriend({ auth, params, response }) {
        const friend = await User.findByOrFail('id', params.friend_id)
        const existance = Friendship.query().where('user_id', auth.user.id).andWhere('friend_id', friend.id).first()
        if (await existance){
            return response.status(409)
        }
        const new_friendship = new Friendship()
        new_friendship.user_id = auth.user.id 
        new_friendship.friend_id = friend.id
        await new_friendship.save()
        return response.status(200)
    }

    public async me({ user, response }: HttpContextContract){
       response.ok(user)
    }

    public async deletefriend({ user, response, params }: HttpContextContract){
        const friendship = await Friendship.query().where('friend_id', params.friend_id).andWhere('user_id', user.id).first()
        if (!friendship){
            return response.status(404)
        }
        friendship.delete()
        return response.status(404)
    }

    public async logout({auth}:HttpContextContract){
        await auth.use('api').revoke()
        return {
          revoked: true
        }
    }

    public async friendsList({user}){
        //const friendsList = await (await Friendship.query().select('friend_id').where('user_id', user.id))
        //return friendsList

        const friends = await Friendship.query().preload('friend_id')
        friends.forEach((friend) => {
            console.log(friend.user_id)
})
    }
}
