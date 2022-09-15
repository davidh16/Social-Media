import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'
import Friendship from 'App/Models/Friendship'
import Post from 'App/Models/Post'
import Drive from '@ioc:Adonis/Core/Drive'
import Mail from '@ioc:Adonis/Addons/Mail'

export default class UsersController {
    public async register({ request, response }: HttpContextContract) {
        const newUser = new User()
        newUser.name = request.body().name
        newUser.surname = request.body().surname
        newUser.email = request.body().email
        newUser.password = request.body().password
        newUser.validated = false
        await newUser.save()
        const registeredUser = await User.query().where('email', newUser.email).firstOrFail()
        await Mail.send((message) => {
            message
                .from('socialmedia@example.com')
                .to(newUser.email)
                .subject('Validation')
                .htmlView('validation', {
                    user: { name: newUser.name },
                    url: `http://localhost:3333/validation/${registeredUser.id}`
                })
        })

        return response.ok('User registered')
    }

    public async validate({params,response}:HttpContextContract){
        const usertToValidate = await User.findByOrFail('id', params.userId)
        usertToValidate.validated = true
        await usertToValidate.save()
        return response.ok("Validation successful")
    }

    public async login({ auth, request, response }: HttpContextContract) {
        const currentUser = await User.findByOrFail('email', request.body().email)
        if (currentUser.validated === false){
            return response.unauthorized('Validation of email adress is needed')
        }
        if (currentUser.password === request.body().password) {
            const token = await auth.use('api').generate(currentUser, {
                expiresIn: '8 hours'
            })
            return token.toJSON()
        }
        else {
            return response.unauthorized('Invalid credentials')
        }
        //treba omogućiti login preko social auth
    }

    public async addFriend({ user, params, response }) {
        const friend = await User.findByOrFail('id', params.friend_id)
        const existance = await Friendship.query().where('user_id', user.id).andWhere('friend_id', friend.id).first()
        if (existance || (user.id === friend.id)){
            return response.forbidden()
        }
        if(friend.validated === false){
            return response.notFound()
        }
        const newFriendship = new Friendship()
        newFriendship.userId = user.id 
        newFriendship.friendId = friend.id
        await newFriendship.save()
        return response.ok(`${friend.name} has been added as a friend`)
    }

    public async me({ user, response }: HttpContextContract){
       response.ok(user)
    }

    public async deletefriend({ user, response, params }: HttpContextContract){
        const friendship = await Friendship.query().where('friend_id', params.friend_id).andWhere('user_id', user.id).first()
        if (!friendship){
            return response.notFound()
        }
        friendship.delete()
        return response.ok("Friend deleted")
    }

    public async logout({auth}:HttpContextContract){
        await auth.use('api').revoke()
        return {
          revoked: true
        }
    }

    public async getFriendsList({user}:HttpContextContract){
        const friendsList = await Friendship.query().where('userId', user.id).preload('friend')
        return friendsList
    }

    public async post({request, response, user}:HttpContextContract){
        const new_post = new Post()
        new_post.description = request.input('description')
        new_post.userId = user.id
        const image = request.file('image')
        if (image){
            await image.moveToDisk('')
            new_post.image = image.fileName
        }
        await new_post.save()
        return response.ok(new_post)
    }

    public async getPostsList({user}:HttpContextContract){
        const postsList = await Post.query().where('userId', user.id).preload('author')
        return postsList
    }//vježba - preload

    public async like({params, response}:HttpContextContract){
        const likedPost = await Post.findByOrFail('post_id', params.post_id)
        likedPost.likes++
        await likedPost.save()
        return response.ok("Liked")
        //potrebno ograničiti usera da može lajkati samo jednom
        //potencijalno ograničiti usera da može lajkati samo postove svojih prijatelja
    }

    }



