const userRouter = require('./users')
const courseRouter = require('./courses')
const blogRouter = require('./blogs')
const roleRouter = require('./roles')
const authRouter = require('./auth')
const lessonRouter = require('./lessons') 
const currentUserRouter = require('./currentUser') 
const commentRouter = require('./comments') 
const topicRouter = require('./topics') 

const apiUserRouter = require('./api/apiUsers')
const apiCourseRouter = require('./api/apiCourses')
const apiBlogRouter = require('./api/apiBlogs')
const apiAuthRouter = require('./api/apiAuths')
const apiLessonRouter = require('./api/apiLessons') 
const apiCurrentUserRouter = require('./api/apiCurrentUser') 
const apiCommentRouter = require('./api/apiComments') 

function route(app) {

    app.use('/api/users', apiUserRouter)
    app.use('/api/courses', apiCourseRouter)
    app.use('/api/blogs', apiBlogRouter)
    app.use('/api/auth', apiAuthRouter)
    app.use('/api/lessons', apiLessonRouter)
    app.use('/api/comments', apiCommentRouter)
    app.use('/api', apiCurrentUserRouter)

    app.use('/users', userRouter)
    app.use('/roles', roleRouter)
    app.use('/courses', courseRouter)
    app.use('/blogs', blogRouter)
    app.use('/auth', authRouter)
    app.use('/lessons', lessonRouter)
    app.use('/comments', commentRouter)
    app.use('/topics', topicRouter)
    app.use('/', currentUserRouter)

}

module.exports = route
