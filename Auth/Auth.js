const jwt = require("jsonwebtoken")

class AuthController {
    async CreatOrderAuth(req, res, next) {
        try {
            const token = req.headers.token
            console.log(req.headers);
            
            if (!token) return res.status(400).send({ message: "Unauthrized" })
            return jwt.verify(token, process.env.JWT_SECRATE, (err, data) => {
                if (data) {
                    req.body.userInfo = data
                    return next()
                }
                if (err) {
                    console.log(err);
                    return res.status(400).send({ message: "Unauthrized" })
                }
            })


        } catch (error) {
            console.log(error);
            return res.status(500).send({ message: "Internal Server Error" })
        }
    }
}

const authController = new AuthController();
module.exports = authController