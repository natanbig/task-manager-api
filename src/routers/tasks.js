const Tasks = require('../models/task')
const {sendResponse, validateUpdateOperation} = require('../servises/index')
const auth = require('../middleware/auth')
module.exports = tasks => {
    tasks
        .post('/', auth, async ctx => {
            try {
                // const task = new Tasks(ctx.request.body)
                const task = new Tasks({
                    ...ctx.request.body,
                    owner: ctx.request.user._id
                })
                await task.save()
                await sendResponse(ctx, task)
            } catch (error) {
                await sendResponse(ctx, error)
            }
        })
        //GET /tasks?completed=true
        //GET /tasks?limit=10&skip=10
        //GET /tasks?sortBy=createdAt_desc
        .get('/', auth, async ctx => {
            const match = {}
            const sort = {}
            if (ctx.query.completed) {
                match.completed = ctx.query.completed === 'true'
            }
            if (ctx.query.sortBy) {
                const parts = ctx.query.sortBy.split(':')
                sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
            }

            try {
                // const task = await Tasks.find({owner: ctx.request.user._id})
                await ctx.request.user.populate({
                    path: 'tasks',
                    match,
                    options: {
                        limit: parseInt(ctx.query.limit),
                        skip: parseInt(ctx.query.skip),
                        sort
                    }
                }).execPopulate()
                await sendResponse(ctx, ctx.request.user.tasks)
            } catch (error) {
                await sendResponse(ctx, error, 500)
            }
        })
        .get('/:id', auth, async ctx => {

            try {
                const _id = ctx.params.id
                const task = await Tasks.findOne({_id, owner: ctx.request.user._id})
                // const task = await Tasks.findById(_id)
                if (!task) {
                    return await sendResponse(ctx, 'Cannot find required task')
                }
                await sendResponse(ctx, task)
            } catch (error) {
                await sendResponse(ctx, error, 500)
            }
        })
        .patch('/:id', auth, async ctx => {
            const {isValidOperation, updates} = await validateUpdateOperation(ctx, ['description', 'completed'])
            if (!isValidOperation) {
                return await sendResponse(ctx, 'Invalid updates', 400)
            }
            try {
                const task = await Tasks.findOne({_id: ctx.params.id, owner: ctx.request.user._id})

                if (!task) {
                    return await sendResponse(ctx, 'Cannot update required task')
                }
                updates.forEach(update => task[update] = ctx.request.body[update])
                await task.save()
                await sendResponse(ctx, task)
            } catch (error) {
                await sendResponse(ctx, error, 500)
            }
        })
        .delete('/:id', auth, async ctx => {
            try {
                const task = await Tasks.findOneAndDelete({_id: ctx.params.id, owner: ctx.request.user._id})
                if (!task) {
                    return await sendResponse(ctx, 'Cannot delete required task', 500)
                }
                await sendResponse(ctx, task)
            } catch (error) {
                await sendResponse(ctx, error, 500)
            }
        })

}