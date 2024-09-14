const Validation = require("../../User/Validation")
const adminUserModel = require("./AdminUserModel")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const Randomstring = require("randomstring")
const Send = require("../SendOPT/OTP")

class AdminUserController {

    async CreateAdminUser(req, res) {
        try {

            let user = req.body

            const ValidationResult = Validation(req.body, "AdminUser")

            if (ValidationResult.length > 0) {
                return res.status(400).send({ message: "Validation Error", ValidationResult: ValidationResult })
            }

            const EncodePassword = bcrypt.hashSync(user.password, 8)

            if (!EncodePassword) {
                return res.status(500).send({ message: "Somthing Went Wrong" })
            }
            user.password = EncodePassword

            const token = jwt.sign({ ...user }, process.env.JWT_SECRATE, { expiresIn: '30d' })

            if (!token) return res.status(500).send({ message: "Somthing Went Wrong" })

            user = { ...user, token: token }

            const result = await adminUserModel.create(user)

            if (!result) return res.status(400).send({ message: "Somthing Went Wrong" })

            user = result._doc

            delete user.password

            return res.status(200).send({ message: "Success", user: { ...user, token: token } })

        } catch (error) {
            console.log(error);
            if (error && error.message && error.message.includes("E11000")) {
                return res.status(400).send({ message: "Valiodation Error", ValidationResult: [{ key: "email", message: "email Alredy Exist" }] })
            }
            return res.status(500).send({ message: "Internal Server Error" })
        }
    }

    async OtpVerfy(req, res) {
        try {
            const { otp, email } = req.body;

            if (!otp) return res.status(400).send({ message: "Missing Dependency Otp" });

            if (!email) return res.status(400).send({ message: "Missing Dependency Email" });

            const user = await adminUserModel.findOne({ email });

            if (!user) {
                return res.status(404).send({ message: "User not found" });
            }
            const isOtpValid = await bcrypt.compare(otp, user.otp);

            if (isOtpValid) {
                return res.status(200).send({ message: "OTP verification successful" });

            } else {
                return res.status(400).send({ message: "Valiodation Error", ValidationResult: [{ key: "otp", message: "Invalid OTP" }] });
            }

        } catch (error) {
            console.log(error);
            return res.status(500).send({ message: "Internal Server Error" });
        }
    }
    async AdminLogin(req, res) {
        try {

            const { email, password } = req.body

            const ValidationResult = Validation(req.body, "login")

            if (ValidationResult.length > 0) {
                return res.status(400).send({ message: "Validation Error" })
            }

            const otp = Randomstring.generate({
                charset: "numeric",
                length: 6
            })

            const UserData = {
                email,
                password,
                otp: bcrypt.hashSync(otp, 8),
            }

            const mailOption = {
                from: "jadavpratik743@gmail.com",
                to: UserData.email,
                subject: 'nodemailer test',
                html: `<p>Dear User Your One Time Password - ${otp}`
            }

            const sendMail = await Send(mailOption)

            if (sendMail && sendMail.match("OK")[0] === "OK") {

                let user = await adminUserModel.findOne({ email: UserData.email })

                if (!user) return res.status(400).send({ message: "Validation Error", ValidationResult: [{ key: "email", message: "Email Not Found" }] })

                let update = await adminUserModel.updateOne({ email: email }, { otp: UserData.otp })

                user = user._doc

                if (!(bcrypt.compareSync(password, user.password))) return res.status(400).send({ message: "Validation Error", ValidationResult: [{ key: "password", message: "Password Is Not Match" }] })

                const token = jwt.sign({ ...user }, process.env.JWT_SECRATE, { expiresIn: "30d" })

                delete user.password

                delete user.otp

                if (!token) return res.status({ message: "Somthing Went Wrong" })

                return res.status(200).send({ message: "Success", user: { ...user, token: token } })

            }

            return res.status(400).send({ message: "Verification Faild" })

        } catch (error) {
            console.log(error);
            return res.status(200).send({ message: "Internal Server Error" })
        }
    }

    async GetAdminUser(req, res) {
        try {
            const result = await adminUserModel.find({})

            if (!result) return res.status(400).send({ message: "Somthing Went Wrog" })

            return res.status(200).send({ message: "Success", user: result })

        } catch (error) {
            console.log(error);
            return res.status(500).send({ message: "Internal Server Error" })
        }
    }

    async DeleUser(req, res) {
        try {
            const { id } = req.params
            const result = await adminUserModel.deleteOne({ _id: id })
            if (result) return res.status(200).send({ message: "Success", result })
            return res.status(400).send({ message: "Somthing Went Wrong" })
        } catch (error) {
            return res.status(400).send({ message: "Internal Server Error" })
        }
    }

    async UpdateUser(req, res) {
        try {
            const { id } = req.params
            const body = req.body
            const result = await adminUserModel.updateOne({ _id: id }, body)
            if (result.modifiedCount > 0 || result.matchedCount > 0) {
                return res.status(200).send({ message: "Success", result })
            }
            return res.status(400).send({ message: "Somthing Wentn Wrong" })
        } catch (error) {
            console.log(error);
            return res.status(500).send({ message: "Interbal Server Error" })
        }
    }
}


const adminUserController = new AdminUserController()
module.exports = adminUserController