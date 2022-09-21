import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import PostValidator from 'App/Validators/PostValidator'
import Post from 'App/Models/Post'
import User from 'App/Models/User'

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
        if(!postToDelete){
            return response.notFound('Post not found')
        } 
        if(postToDelete.userId === user.id){
            await postToDelete.delete()
            return response.ok('Post deleted')
        }
        return response.forbidden('You can not delete posts of other users')
    }
    
    public async getMyPostsList({user,response, request}:HttpContextContract){
        const page = request.input('page',1)
        const limit = request.input('limit',5)
        const postsList = await Post.query().where('userId', user.id).paginate(page,limit)
        return response.ok(postsList)
    }

    public async getFriendsPostsList({user, response, params}:HttpContextContract){
        const friendsList = await User.query().where('id', user.id).preload('friends').first()
        if((friendsList!.friends.map(friend => friend.id).includes(Number(params.friend_id)))){
            const friendsPosts = await User.query().where('id', params.friend_id).preload('posts')
            return response.ok(friendsPosts)
        }
        return response.forbidden('You can not access to posts of users that are not your friends')
    }

    public async like({params, response, user}:HttpContextContract){
        const likedPost = await Post.query().where('postId', params.post_id).preload('likes').first()
        if(!likedPost){
            return response.notFound('Post not found')
        }
        if(likedPost!.numberOfLikes !== 0){
            if(likedPost!['likes'].map(likedBy => likedBy.email).includes(user.email)){
                return response.redirect().toPath(`/dislike/${params.post_id}`)
            } 
        }
        const friendsList = await User.query().where('id', user.id).preload('friends').first()
        if((friendsList!.friends.map(friend => friend.id).includes(likedPost!.userId)) || likedPost.userId === user.id){
            likedPost.numberOfLikes++
            await likedPost.save()
            await likedPost!.related('likes').attach([user.id])
            return response.ok('Post liked')
        }
        if(!(friendsList!.friends.map(friend => friend.id).includes(likedPost!.userId))){
            return response.forbidden('You can not like posts of users that are not your friends')
        }
    }

    public async dislike({params, response, user}:HttpContextContract){
        const dislikedPost = await Post.query().where('postId', params.post_id).preload('likes').first()
        if(!dislikedPost){
            return response.notFound('Post not found')
        }
        if(dislikedPost!.numberOfLikes !== 0){
            if(dislikedPost!.likes.map(likedBy => likedBy.email).includes(user.email)){
                dislikedPost.numberOfLikes--
                await dislikedPost.save()
                await dislikedPost!.related('likes').detach([user.id])
                return response.ok('Post disliked')
            } 
        }
    }

    public async getPostLikedByList({params, response, user}:HttpContextContract){
        const likedByList = await Post.query().where('postId', params.post_id).preload('likes').first()
        const friendsList = await User.query().where('id', user.id).preload('friends').first()
        if(likedByList && (likedByList.userId === user.id || (friendsList!.friends.map(friend => friend.id).includes(likedByList!.userId)))){
            return response.ok(likedByList)
        }
        if(!likedByList){
            return response.notFound('Post not found')
        }
        return response.forbidden('You can not access to posts that are not yours or of users that are not your friends')
    }
}