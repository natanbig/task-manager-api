const User = require('../models/user')
const {sendResponse, validateUpdateOperation} = require('../servises/index')
const auth = require('../middleware/auth')
const sharp = require('sharp')
const {fileUpload, upload} = require('../middleware/files')
const Email = require('../../src/emails/account')
module.exports = users => {
    users
        .post('/', async ctx => {
            const user = new User(ctx.request.body)
            try {
                await user.save()
                const email = new Email(user.email, user.name)
                email.sendEmail()
                const token = await user.generateAuthToken()
                await sendResponse(ctx, {user, token}, 201)
            } catch (error) {
                await sendResponse(ctx, error.message, 400)
            }
        })

        .post('/login', async ctx => {
            try {
                const user = await User.findByCredentials(ctx.request.body.email, ctx.request.body.password)
                const token = await user.generateAuthToken()
                await sendResponse(ctx, {user, token})
            } catch (error) {
                await sendResponse(ctx, error.message, 400)
            }
        })
        .post('/logout', auth, async ctx => {
            try {
                ctx.request.user.tokens = ctx.request.user.tokens.filter(token => token.token !== ctx.request.token)
                await ctx.request.user.save()
                ctx.status = 200
            } catch (error) {
                sendResponse(ctx, '', 500)
            }
        })
        .post('/logoutAll', auth, async ctx => {
            try {
                ctx.request.user.tokens = []
                await ctx.request.user.save()
                ctx.status = 200
            } catch (error) {
                ctx.status = 500
            }


        })
        .get('/me', auth, async ctx => {
            await sendResponse(ctx, ctx.request.user)
        })
        .patch('/me', auth, async ctx => {
            const {isValidOperation, updates} = await validateUpdateOperation(ctx, ['name', 'email', 'password', 'age'])
            if (!isValidOperation) {
                return await sendResponse(ctx, 'Invalid updates', 400)
            }
            try {
                const user = ctx.request.user
                updates.forEach(update => user[update] = ctx.request.body[update])
                await user.save()
                if (!user) {
                    return await sendResponse(ctx, 'Cannot update required user')
                }
                await sendResponse(ctx, user)
            } catch
                (error) {
                await sendResponse(ctx, error, 500)
            }
        })
        .delete('/me', auth, async ctx => {
            try {
                ctx.request.user.remove()
                await sendResponse(ctx, ctx.request.user)
            } catch (error) {
                await sendResponse(ctx, error, 500)
            }
        })
        .post('/me/avatar',
            auth,
            upload.single('upload'),
            async (ctx) => {
                ctx.request.user.avatar = await sharp(ctx.file.buffer).resize({
                    width: 250,
                    height: 250
                }).png().toBuffer()
                await ctx.request.user.save()
                ctx.status = 200
            },
            (error, ctx) => {
                ctx.status = 400
                ctx.body = error.message
            })
        .delete('/me/avatar', auth, async ctx => {
            ctx.request.user.avatar = undefined
            ctx.request.user.save()
            ctx.status =200
        })
        .get('/:id/avatar', async ctx => {
            try {
                const user = await User.findById(ctx.params.id)
                if (!user || !user.avatar) {
                    throw new Error()
                }

                ctx.set('Content-Type', 'image/jpg')
                ctx.body = user.avatar
            } catch (error) {
                ctx.status = 404
            }
        })
}
