import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'
import Mail from '@ioc:Adonis/Addons/Mail'
import Hash from '@ioc:Adonis/Core/Hash'
import RegisterValidator from 'App/Validators/RegisterValidator'
import Env from '@ioc:Adonis/Core/Env'
import UpdateValidator from 'App/Validators/UpdateValidator'
import Redis from '@ioc:Adonis/Addons/Redis'


export default class UsersController {
    public async register({ request, response, auth }: HttpContextContract) {
        const validData = await request.validate(RegisterValidator)
        const newUser = new User()
        newUser.name = validData.name
        newUser.surname = validData.surname
        newUser.email = validData.email
        newUser.password = validData.password
        await newUser.save()
        const registeredUser = await User.query().where('email', newUser.email).firstOrFail()
        const validation_token = await auth.use('api').generate(registeredUser)
        await Redis.connection('local2').set(validation_token.token, registeredUser.id)
        await Mail.send((message) => {
            message
                .from('socialmedia@example.com')
                .to(newUser.email)
                .subject('Validation')
                .htmlView('validation', {
                    user: { name: newUser.name },
                    url: Env.get('VALIDATION_URL') + validation_token.token
                })
        })
        return response.ok('User registered')
    }

    public async validate({params,response}:HttpContextContract){
        const retirevedId = await Redis.connection('local2').get(`${params.validation_token}`)
        if(retirevedId){
            const usertToValidate = await User.findByOrFail('id', retirevedId)
            usertToValidate.validated = true
            await usertToValidate.save()
            return response.ok("Validation successful")
        }
        return response.forbidden('Invalid validation key')
    }

    public async login({ auth, request, response}: HttpContextContract) {
        const currentUser = await User.findByOrFail('email', request.body().email)
        if (currentUser.validated === false){
            return response.notFound('Validation of email adress is needed')
        }
        if (await Hash.verify(currentUser.password!, request.body().password)) {
            const token = await auth.use('api').generate(currentUser, {
                expiresIn: '8 hours'
            })
            return token.toJSON()
          }
        else {
            return response.unauthorized('Invalid credentials')
        }
    }

    public async socialAuthenticationRedirect ({ally}:HttpContextContract){
        return ally.use('github').redirect()
    }

    public async socialAuthenticationCallback ({ally, response, auth}:HttpContextContract){
        const github = ally.use('github')
        if (github.accessDenied()){
            return response.forbidden('Access denied')
        }
        if (github.stateMisMatch()){
            return response.forbidden('Request expired. Retry again')
        }
        if (github.hasError()){
            return github.getError()
        }
        const githubUser = await github.user()
        const user = await User.firstOrCreate({
            email: githubUser.email!,
        },
        {
            name: githubUser.nickName,
            validated: true,
            provider: 'github',
            providerId: githubUser.id
        })
        await auth.use('api').login(user)
    } // nije dovršeno, trebalo bi omogućiti da user može pristupiti istom accountu putem main podataka i social auth podataka

    public async profileUpdate({user, response, request}:HttpContextContract){
        const validData = await request.validate(UpdateValidator)
        user.name = validData.name
        user.surname = validData.surname
        user.password = validData.password
        await user.save()
        return response.ok(user)
    }

    public async deactivate({user,response}:HttpContextContract){
        await user.delete()
        return response.ok('Your account has been deactivated')
    }

    public async me({ user, response }: HttpContextContract){
       response.ok(user)
    }

    public async logout({auth}:HttpContextContract){
        await auth.use('api').revoke()
        return {
          revoked: true
        }
    }

    
    }



