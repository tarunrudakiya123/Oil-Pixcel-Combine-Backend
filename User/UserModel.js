const mongoose = require("mongoose");

class UserModel {
    constructor() {
        this.schema = new mongoose.Schema({
            firstName: { type: String, required: true },
            lastName: { type: String, required: true },
            email: { type: String, required: true, unique: true },
            phone: { type: Number, require: true, length: 10, default: null },
            password: { type: String, required: true, },
            confirmPassword: { type: String, require: true },
            isAdmin: { type: Boolean, required: true, default: false },
        }, { timeStamp: true })
    }
}

const user = new UserModel()
const userModel = mongoose.model("User", user.schema)
module.exports = userModel