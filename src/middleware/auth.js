const jwt = require('jsonwebtoken')
const User = require('../models/user')
module.exports = auth = async (ctx, next) => {
    try {
        const token = ctx.request.get('Authorization').replace('Bearer ', '')
        const decoded = await jwt.verify(token, process.env.TOKEN_SECRET)
        const user = await User.findOne({_id: decoded._id, 'tokens.token': token})
        if (!user) {
            throw new Error()
        }
        ctx.request.token = token
        ctx.request.user = user

    } catch (error) {
        ctx.status = 401
        return ctx.body = 'Error: Please authenticated properly'
    }
    try {
        await next()
    } catch (error) {
        ctx.body = error.message
    }


}