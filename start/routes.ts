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
import UsersController from 'App/Controllers/Http/UsersController'

Route.post('/register', 'UsersController.register')

Route.post('/login', 'UsersController.login')

Route.post('/addfriend/:friend_id', 'UsersController.addFriend').middleware('auth')

Route.get('/users/me', 'UsersController.me').middleware('auth')

Route.delete('/deletefriend/:friend_id', 'UsersController.deletefriend').middleware('auth')

Route.post('/logout', 'UsersController.logout').middleware('auth')

Route.get('/friendslist', 'UsersController.friendsList').middleware('auth')

Route.post('/post', 'UsersController.post').middleware('auth')

Route.get('/validation/:userId', 'UsersController.validate')