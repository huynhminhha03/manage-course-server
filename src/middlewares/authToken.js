const jwt = require('jsonwebtoken')

function authToken(req, res, next) {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (!token) {
        return res.status(401).json({ message: 'No token provided' })
    }

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid token' })
        }
        console.log(user)
        req.user = user // lưu thông tin user từ token vào request object
        next()
    })
}

module.exports = { authToken }
