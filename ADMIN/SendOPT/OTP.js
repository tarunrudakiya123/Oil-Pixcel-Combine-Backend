const nodemailer = require("nodemailer")
const Send = (mailOPtion) => {
    return new Promise((resolve, reject) => {
        const Transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: "jadavpratik743@gmail.com",
                pass: 'rktgcbaepqksdetz'
            }
        })
        Transporter.sendMail(mailOPtion, function (error, info) {
            if (error) {
                reject(error)
            } else {
                resolve("Email sent" + info.response)
            }
        })
    })
}
module.exports = Send