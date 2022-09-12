
import Route from '@ioc:Adonis/Core/Route'

import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { HttpContext } from '@adonisjs/core/build/standalone'



export default class Auth {
  public async handle(
    ctx,
    next: () => Promise<void>
  ) {
    //Route.get('dashboard', async (ctx) => {
        await ctx.auth.use('api').authenticate()
        ctx.user = ctx.auth.use('api').user!

    await next()
  }
}



