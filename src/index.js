const express = require('express')
const morgan = require('morgan')
const session = require('express-session')
// const { wss } = require('./sockets'); // Import WebSocket server
const cors = require('cors')
require('dotenv').config()

const route = require('./routes')
const db = require('./config/db')



//Connect to DB
db.connect()

// Listen for the SIGINT signal (Ctrl+C) to disconnect and exit the application
process.on('SIGINT', async () => {
    await db.disconnect()
    process.exit(0) //Exit
})

//Listen for the SIGTERM signal (usually sent by the system or via kill command) to disconnect and exit the application
process.on('SIGTERM', async () => {
    // Listen kill
    await db.disconnect()
    process.exit(0) //Exit
})

const PORT = process.env.PORT || 5000

// Danh sách các origins được phép
const allowedOrigins = [
    'http://localhost:3001',
    'http://localhost:5173',
    'http://localhost:3002',
    'http://localhost:3000',
]

const app = express()

app.use(
    cors({
        origin: (origin, callback) => {
            if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
                callback(null, true)
            } else {
                callback(new Error('Not allowed by CORS'))
            }
        },
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true,
    })
)

app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: true,
        cookie: { secure: false },
    })
)

app.use(express.static('public'))

app.use(express.json())

//middleware xử lý dữ liệu từ form submit lên
app.use(
    express.urlencoded({
        extended: true,
    })
)

//HTTP logger
app.use(morgan('combined'))

//Route init
app.use((req, res, next) => {
    console.log('Session ID:', req.session.id)
    console.log('Session:', req.session)
    next()
})

route(app)

app.listen(PORT, () => {
    console.log('App listening on port: ' + PORT)
})
