module.exports = {
    sendResponse: async (ctx, data, status) => {
        if (status) {
            ctx.status = status
        }
        ctx.body = data
    },

    validateUpdateOperation: async (ctx, allowedUpdates) => {
        const updates = Object.keys(ctx.request.body).filter(update => !['token', 'user'].includes(update))
        const isValidOperation = updates.every(update => allowedUpdates.includes(update))
        return {isValidOperation, updates}
    }
}