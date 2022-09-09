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
        const new_friendship = new Friendship()
        new_friendship.user_id = auth.user.id //how to get info about logged in user ???
        new_friendship.friend_id = friend.id
        await new_friendship.save()
        return response.status(200)
    }
}
