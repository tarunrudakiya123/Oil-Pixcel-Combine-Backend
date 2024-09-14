const { default: mongoose } = require("mongoose");

class AdminUserModel {
    constructor() {
        this.schema = new mongoose.Schema({
            fullName: { type: String, required: true },
            email: { type: String, required: true, unique: true },
            password: { type: String, required: true },
            token: { type: String, default: null },
            otp: { type: String, reqired: true, default: null },
            roll: { type: String, require: true },
        }, { timestamps: true })
    }
}
const adminUser = new AdminUserModel()
const adminUserModel = mongoose.model("tbl_Admins", adminUser.schema)
module.exports = adminUserModel