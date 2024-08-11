const mongoose = require('mongoose')

// Hàm kết nối đến cơ sở dữ liệu
async function connect() {
    try {
        await mongoose.connect('mongodb://127.0.0.1/manage_course_dev')
        console.log('Successfully connected to the database!')
    } catch (error) {
        console.log('Failed to connect to the database:', error.message)
    }
}

// Hàm ngắt kết nối khỏi cơ sở dữ liệu
async function disconnect() {
    try {
        await mongoose.disconnect()
        console.log('Successfully disconnected from the database!')
    } catch (error) {
        console.log('Failed to disconnect from the database:', error.message)
    }
}

// Lắng nghe sự kiện kết nối và ngắt kết nối
mongoose.connection.on('connected', () => {
    console.log('Mongoose connection open.')
})

mongoose.connection.on('disconnected', () => {
    console.log('Mongoose connection disconnected.')
})

mongoose.connection.on('error', (err) => {
    console.log('Mongoose connection error:', err.message)
})

// Xuất các hàm connect và disconnect
module.exports = { connect, disconnect }
