const Razorpay = require("razorpay")
const DeliverDay = require("../Constant")
const orderModel = require("./OrderModel")

function CreateRozorPayORder(options) {
    return new Promise((resolve, reject) => {

        var instance = new Razorpay({
            key_id: process.env.API_KEY,
            key_secret: process.env.KEY_SECRATE,
        });
        // console.log(process.env.API_KEY, process.env.KEY_SECRATE);3
        instance.orders.create(options, (err, order) => {
            // console.log(options, err, order)
            if (err) return reject(err)
            resolve(order)
        })
    })
}

class OrderController {

    async CreateOrder(req, res) {
        try {
            const { products, paymentMethod, shippingAddress, userInfo, totalPrice } = req.body

            if (!products) return res.status(400).send({ message: "Missing Dipendecy of Products" })

            if (!paymentMethod) return res.status(500).send({ message: "Missing Dipendecy of PaymentMethods" })

            if (!shippingAddress) return res.status(500).send({ message: "Missing Dipendecy of ShppingAddress" })

            if (!userInfo) return res.status(500).send({ message: "Missing Dipendecy of UserInfo" })

            const deliveryDate = new Date()

            deliveryDate.setDate(deliveryDate.getDate() + DeliverDay)

            const orderDetails = {
                products,
                paymentMethod,
                shippingAddress,
                userId: userInfo,
                deliverdIn: deliveryDate,
                totalPrice: totalPrice,
                price: totalPrice,

            }

            let order = await orderModel.create(orderDetails)

            order = { ...order._doc, RazorpayDetails: null }

            if (paymentMethod === "cod") {
                if (!order) return res.status(500).send({ message: "Somthing went wrong", })
                return res.status(200).send({ message: "Success", order })
            } else {

                const options = {
                    amount: totalPrice * 100,
                    currency: "INR",
                    receipt: "rcpt_id_" + order._id
                }

                const RozorpayResult = await CreateRozorPayORder(options)

                if (!RozorpayResult) return res.status(500).send({ message: "Somthing went wrong" })

                order = {
                    ...order,
                    RazorpayDetails: { ...RozorpayResult, apikey: process.env.API_KEY }
                }

                return res.status(200).send({ message: "Success", order })

            }
        } catch (error) {
            console.log(error);
            return res.status(500).send({ message: "Internal server error" })
        }
    }

    async GetOrder(req, res) {
        try {
            const { id } = req.query
            // const result = await orderModel.find({ "user_id": req.body.userInfo._id })
            const result = await orderModel.find({ "userId._id": id })

            
            

            if (result) return res.status(200).send({ message: "Success", order: result })

            return res.status(500).send({ message: "Somthing Went Wrong " })

        } catch (error) {
            return res.status(500).send({ message: "Internal Server Error" })
        }
    }

    async getOrderByID(req, res) {
        try {
            const { id } = req.params

            if (!id) {
                return res.status(400).send({ message: 'Bad Request' })
            }

            const result = await orderModel.findById({ _id: id })

            if (result) {
                return res.status(200).send({ message: "success", order: result })

            }
            return res.status(500).send({ message: 'something went wrong' })

        } catch (error) {
            return res.status(500).send({ message: 'internal server error' })

        }

    }


    async PaymentVerify(req, res) {
        const { razorpay_payment_id, razorpayOrderId, orderId } = req.body
        const instance = new Razorpay({
            key_id: process.env.API_KEY,
            key_secret: process.env.KEY_SECRATE,
        })
        try {

            const response = await instance.payments.fetch(razorpay_payment_id)

            if ((response.status === "captured" || response.status === "authorized") && response.order_id === razorpayOrderId) {

                const update = await orderModel.updateOne({ _id: orderId }, { paymentStatus: "verify" })
                if (update.modifiedCount > 0) {
                    return res.status(200).send({ message: "Success", orderId: orderId })
                }
                return res.status(500).send({ message: "Somthing Went Wrong" })

            } else {
                await orderModel.updateOne({ _id: orderId }, { paymentStatus: "reject" })

                return res.status(400).send({ message: "Payment Verification Failed" })
            }

        } catch (error) {
            console.log(error);
            return res.status(500).send({ message: "Internal Server Error" })
        }
    }
}

const orderController = new OrderController()
module.exports = orderController