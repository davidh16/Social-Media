import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'
import Friendship from 'App/Models/Friendship'
import Post from 'App/Models/Post'
import Drive from '@ioc:Adonis/Core/Drive'
import Mail from '@ioc:Adonis/Addons/Mail'
import { Response } from '@adonisjs/core/build/standalone'

export default class UsersController {
    public async register({ request, response }: HttpContextContract) {
        const new_user = new User()
        new_user.name = request.body().name
        new_user.surname = request.body().surname
        new_user.email = request.body().email
        new_user.password = request.body().password
        new_user.validated = false
        await new_user.save()
        const registeredUser = await User.query().where('email', new_user.email).firstOrFail()
        await Mail.send((message) => {
            message
                .from('socialmedia@example.com')
                .to(new_user.email)
                .subject('Validation')
                .htmlView('validation', {
                    user: { name: new_user.name },
                    url: `localhost:3333/validation/${registeredUser.id}`
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
        const current_user = await User.findByOrFail('email', request.body().email)
        if (current_user.validated == false){
            return response.unauthorized('Validation of email adress is needed')
        }
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

    public async addFriend({ user, params, response }) {
        const friend = await User.findByOrFail('id', params.friend_id)
        const existance = await Friendship.query().where('user_id', user.id).andWhere('friend_id', friend.id).first()
        if (existance || (user.id == params.friend_id) || (friend.validated = false)){
            return response.forbidden()
        }
        const new_friendship = new Friendship()
        new_friendship.user_id = user.id 
        new_friendship.friend_id = friend.id
        await new_friendship.save()
        return response.notFound()
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
        return response.notFound()
    }

    public async logout({auth}:HttpContextContract){
        await auth.use('api').revoke()
        return {
          revoked: true
        }
    }

//     public async friendsList({user}){
//         //const friendsList = await (await Friendship.query().select('friend_id').where('user_id', user.id))
//         //return friendsList
        

//         // const friends = await Friendship.query().preload('friend_id')
//         // friends.forEach((friend) => {
//         //     console.log(friend.user_id)
// })

    public async post({request, response, user}:HttpContextContract){
        const new_post = new Post()
        new_post.description = request.input('description')
        new_post.likes = 0
        new_post.user_id = user.id
        const image = request.file('image')
        if (image){
            let imageName = 'image' + '.' + `${image.extname}`
            const imagetUrl = await Drive.getUrl(imageName)
            const existance = await Post.query().where('image', imagetUrl).first()
            if (existance){
                var i:number = 1
                var existing: Post | null = existance
                while(existing!){
                    let newImageName = 'image' + `${i}` + '.' + `${image.extname}`
                    let newImagetUrl = await Drive.getUrl(newImageName)
                    var existing = await Post.query().where('image', newImagetUrl).first()
                    imageName = newImageName
                    i++
                }
            }
            await image.moveToDisk("",{name: imageName})
            new_post.image = await Drive.getUrl(imageName)
        }
        await new_post.save()
        return response.ok(new_post)
    }

    public async like({params, response}:HttpContextContract){
        const likedPost = await Post.findByOrFail('post_id', params.post_id)
        likedPost.likes++
        await likedPost.save()
        return response.ok("Liked")
        //potrebno ograničiti usera da može lajkati samo jednom
        //potencijalno ograničiti usera da može lajkati samo postove svojih prijatelja
    }

    }



