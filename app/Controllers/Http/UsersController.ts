import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'
import Mail from '@ioc:Adonis/Addons/Mail'
import Hash from '@ioc:Adonis/Core/Hash'
import RegisterValidator from 'App/Validators/RegisterValidator'
import Env from '@ioc:Adonis/Core/Env'
import UpdateValidator from 'App/Validators/UpdateValidator'


export default class UsersController {
    public async register({ request, response }: HttpContextContract) {

        const validData = await request.validate(RegisterValidator)
    
        const newUser = new User()
        newUser.name = validData.name
        newUser.surname = validData.surname
        newUser.email = validData.email
        newUser.password = validData.password

        await newUser.save()
        const registeredUser = await User.query().where('email', newUser.email).firstOrFail()
        await Mail.send((message) => {
            message
                .from('socialmedia@example.com')
                .to(newUser.email)
                .subject('Validation')
                .htmlView('validation', {
                    user: { name: newUser.name },
                    url: Env.get('VALIDATION_URL') + registeredUser.id.toString()
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

    // public async socialAuthenticationRedirect ({ally}:HttpContextContract){
    //     return ally.use('google').redirect()
    // }

    // public async socialAuthenticationCallback ({ally, response, auth}:HttpContextContract){
    //     const google = ally.use('google')
    //     if (google.accessDenied()){
    //         return response.forbidden('Access denied')
    //     }
    //     if (google.stateMisMatch()){
    //         return response.forbidden('Request expired. Retry again')
    //     }
    //     if (google.hasError()){
    //         return google.getError()
    //     }
    //     const googleUser = await google.user()

    //     const user = await User.firstOrCreate({
    //         email: googleUser.email,
            
    //     },{
    //         name: googleUser.name,
    //         accessToken: googleUser.token.token,
    //         isVerified: googleUser.emailVerificationState === 'verified'
    //     })
    //     await auth.use('api').login(user)
    // }

    public async profileUpdate({user, response, request}:HttpContextContract){
        const validData = await request.validate(UpdateValidator)

        Object.entries(validData).forEach(
            ([key, value]) => {if(validData[key] !== user[key]){
                user[key]=value
            }
            });
        await user.save()
        return response.ok(user)//vjerojatno bi se moglo bez for loopa što bi bilo bolje
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



