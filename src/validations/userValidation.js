const Joi = require('joi')

const userValidate = (data) => {
    const userSchema = Joi.object({
        name: Joi.string().required(),
        email: Joi.string().email(new RegExp('gmail.com')).required(),
        password: Joi.string().min(6).required(),
    })

    return userSchema.validate(data)
}

module.exports = userValidate
