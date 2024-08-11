const express = require('express')
const morgan = require('morgan')

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

const corsOptions = {
    origin: 'http://localhost:3001', // Địa chỉ frontend của bạn
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Authorization',
    credentials: true,
}

const app = express()

app.use(cors(corsOptions))

//middleware xử lý dữ liệu từ form submit lên
app.use(
    express.urlencoded({
        extended: true,
    })
)

//HTTP logger
app.use(morgan('combined'))

//Route init
route(app)

app.listen(PORT, () => {
    console.log('App listening on port: ' + PORT)
})
