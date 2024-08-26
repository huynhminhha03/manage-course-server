const mongoose = require('mongoose')

const Schema = mongoose.Schema

const InvoiceSchema = new Schema({
    amount: { type: Number, required: true},
    order_desc: {type: String},
    vnp_response_code: {type: String},
    vnp_transaction_no: {type: String},
    user_course_id: { type: Schema.Types.ObjectId, ref: 'UserCourse', required: true }
})

module.exports = mongoose.model('Invoice', InvoiceSchema)
