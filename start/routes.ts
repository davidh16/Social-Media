/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes.ts` as follows
|
| import './routes/cart'
| import './routes/customer'
|
*/


import Route from '@ioc:Adonis/Core/Route'

Route.post('/register', 'UsersController.register')

Route.post('/login', 'UsersController.login')

Route.get('/users/me', 'UsersController.me').middleware('auth')

Route.post('/logout', 'UsersController.logout').middleware('auth')

Route.get('/validation/:validation_token', 'UsersController.verifyUser')

Route.put('/update', 'UsersController.profileUpdate').middleware('auth')

Route.delete('/deactivate', 'UsersController.deactivate').middleware('auth')

Route.get('/github/redirect', 'UsersController.socialAuthenticationRedirect')

Route.get('/github/callback', 'UsersController.socialAuthenticationCallback')



Route.post('/addfriend/:friend_id', 'FriendsController.addFriend').middleware('auth')

Route.delete('/deletefriend/:friend_id', 'FriendsController.deleteFriend').middleware('auth')

Route.get('/friend/:friend_id','FriendsController.getFriend').middleware('auth')

Route.get('/friendslist', 'FriendsController.getFriendsList').middleware('auth')



Route.post('/post', 'PostsController.post').middleware('auth')

Route.put('/like/:post_id', 'PostsController.like').middleware('auth')

Route.put('dislike/:post_id', 'PostsController.dislike').middleware('auth')

Route.put('/postupdate/:post_id', 'PostsController.postUpdate').middleware('auth')

Route.get('/likes/:post_id', 'PostsController.getPostLikedByList').middleware('auth')

Route.get('/postslist', 'PostsController.getMyPostsList').middleware('auth')

Route.get('/postslist/:friend_id','PostsController.getFriendsPostsList').middleware('auth')

Route.delete('/postdelete/:post_id', 'PostsController.deletePost').middleware('auth')


