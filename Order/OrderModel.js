const { default: mongoose } = require("mongoose");

class OrderModel{

    constructor(){
        this.schema = new mongoose.Schema({
            products: { type: Array, required: true},
            userId: { type: Object, required: true},
            paymentMethod: { type: String, required: true, default:"cod"},
            paymentStatus: { type: String, required: true, default:"pending"},
            price: { type: Number, required: true},
            totalPrice: { type: Number, required: true},
            shippingAddress: { type: Object, required: true},
            deliveryStatus: { type: String, required: true, default:"pending"},
            deliverIn: { type: Date, require: true },
        }, { timestamps: true })
    }

}

const order = new OrderModel()

const orderModel = mongoose.model("Order", order.schema)
module.exports =  orderModel