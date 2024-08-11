function authRole(allowedRoles) {
    return (req, res, next) => {
        const { role } = req.user // req.user được thêm từ middleware authToken
        if (allowedRoles.includes(role)) {
            next()
        } else {
            res.status(403).json({ message: 'Forbidden' })
        }
    }
}

module.exports = { authRole }
