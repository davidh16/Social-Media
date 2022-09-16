import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'
import Friendship from 'App/Models/Friendship'
import Post from 'App/Models/Post'
import Mail from '@ioc:Adonis/Addons/Mail'
import Like from 'App/Models/Like'
import Hash from '@ioc:Adonis/Core/Hash'


export default class UsersController {
    public async register({ request, response }: HttpContextContract) {
        const newUser = new User()
        newUser.name = request.body().name
        newUser.surname = request.body().surname
        newUser.email = request.body().email

        const hashedPassword = await Hash.make(request.body().password)
        newUser.password = hashedPassword


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

    public async login({ auth, request, response}: HttpContextContract) {
        const currentUser = await User.findByOrFail('email', request.body().email)
        if (currentUser.validated === false){
            return response.notFound('Validation of email adress is needed')
        }
        if (await Hash.verify(currentUser.password, request.body().password)) {
            const token = await auth.use('api').generate(currentUser, {
                expiresIn: '8 hours'
            })
            return token.toJSON()
          }
        else {
            return response.unauthorized('Invalid credentials')
        }
        //treba omogućiti social auth
    }

    public async addFriend({ user, params, response }) {
        const addedUser = await User.findByOrFail('id', params.friend_id)
        const existance1 = await Friendship.query().where('user_id', user.id).andWhere('friend_id', addedUser.id).first()
        const existance2 = await Friendship.query().where('friend_id', user.id).andWhere('user_id', addedUser.id).first()
        if (existance1 || existance2 || (user.id === addedUser.id)){
            return response.forbidden()
        }
        if(addedUser.validated === false){
            return response.notFound()
        }
        const newFriendship = new Friendship()
        newFriendship.userId = user.id 
        newFriendship.friendId = addedUser.id
        await newFriendship.save()
        return response.ok(`${addedUser.name} has been added as a friend`)
    }

    public async me({ user, response }: HttpContextContract){
       response.ok(user)
    }

    public async deletefriend({ user, response, params }: HttpContextContract){
        const friendship1 = await Friendship.query().where('friend_id', params.friend_id).andWhere('user_id', user.id).first()
        const friendship2 = await Friendship.query().where('user_id', params.friend_id).andWhere('friend_id', user.id).first()

        if (!friendship1){
            if (!friendship2){
                return response.notFound()
            }
            friendship2.delete()
        }
        friendship1!.delete()
        return response.ok("Friend deleted")
    }

    public async logout({auth}:HttpContextContract){
        await auth.use('api').revoke()
        return {
          revoked: true
        }
    }

    public async getFriendsList({user}:HttpContextContract){
        const friendsList = await Friendship.query().where('userId', user.id).orWhere('friendId', user.id).preload('friend')
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

    public async like({params, response, user}:HttpContextContract){
        const likes = await Like.query().where('postId', params.post_id).preload('likedby')
        const peopleWhoLiked = likes.map((item) => {
            return item.likedby.email
        })
        if(peopleWhoLiked.includes(user.email)){
            return response.forbidden('Already liked')
        }
        const likedPost = await Post.findByOrFail('postId', params.post_id)
        likedPost.numberOfLikes++
        await likedPost.save()
        const like = new Like
        like.userId = user.id,
        like.postId = params.post_id
        await like.save()
        return response.ok('Liked')
    }
    }



