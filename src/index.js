const Koa = require('koa')
const Router = require('koa-router')
require('./db/mongoose')
const userRouter = require('./routers/users')
const taskRouter = require('./routers/tasks')
const port = process.env.PORT
const app = new Koa()
const router = new Router()
const users = new Router();
const tasks = new Router()
const bodyParser = require('koa-bodyparser')

userRouter(users)
taskRouter(tasks)

router
    .use('/users', users.routes())
    .use('/tasks', tasks.routes())
app
    .use(bodyParser())
    .use(router.routes())
    .listen(port, () => {
        console.log('Server is listening on port ' + port)
    })



