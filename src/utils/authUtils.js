const bcrypt = require('bcrypt')

async function hashPassword(password) {
    try {
        const salt = await bcrypt.genSalt(10) // Tạo muối với độ dài 10 vòng
        const hashedPassword = await bcrypt.hash(password, salt) // Băm mật khẩu
        return hashedPassword
    } catch (error) {
        throw new Error('Error hashing password: ' + error.message)
    }
}
async function checkPassword(password, hashedPassword) {
    try {
        const isMatch = await bcrypt.compare(password, hashedPassword)
        return isMatch
    } catch (error) {
        throw new Error('Error checking password: ' + error.message)
    }
}

module.exports = { hashPassword, checkPassword }
