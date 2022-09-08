import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'

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
            const token = await auth.use('api').generate(current_user)
            return token.toJSON()
        }
        else {
            return response.unauthorized('Invalid credentials')
        }
    }
}
