const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const OrderSchema = new Schema({
    order_id: { type: String, required: true },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    course_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    amount: { type: Number, required: true },
    pay_date: { type: Date },
    transaction_status: { type: String }
}, { timestamps: true });

const Order = mongoose.model('Order', OrderSchema);

module.exports = Order;
