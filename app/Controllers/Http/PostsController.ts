import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import PostValidator from 'App/Validators/PostValidator'
import Post from 'App/Models/Post'
import Like from 'App/Models/Like'

export default class PostsController {
    public async post({request, response, user}:HttpContextContract){

        const validData = await request.validate(PostValidator)

        const new_post = new Post()
        new_post.description = validData.description
        new_post.userId = user.id
        const image = validData.image
        if (image){
            await image.moveToDisk('')
            new_post.image = image.fileName
        }
        await new_post.save()
        return response.ok(new_post)
    }

    public async postUpdate({request, response, params, user}:HttpContextContract){
        const postToUpdate = await Post.findByOrFail('postId',params.post_id)
        if(postToUpdate.userId !== user.id){
            return response.forbidden("Posts of other users can't be updated")
        }
        const validData = await request.validate(PostValidator)
        postToUpdate.description = validData.description
        await postToUpdate.save()
        return response.ok(postToUpdate)
    }

    public async deletePost({params, response, user}:HttpContextContract){
        const postToDelete = await Post.findByOrFail('postId',params.post_id)
        if(postToDelete && (postToDelete.userId === user.id)){
            await postToDelete.delete()
            return response.ok('Post deleted')
        }
    }
    
    public async getMyPostsList({user,response}:HttpContextContract){
        const postsList = await Post.query().where('userId', user.id)
        return response.ok(postsList)
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

    //getPostLikedByList
    public async getPostLikedByList({params}:HttpContextContract){
        const likedPost = await Post.findByOrFail('postId',params.post_id)
        const likedByList = await likedPost.related('likes').query()
        return likedByList
    }

}
