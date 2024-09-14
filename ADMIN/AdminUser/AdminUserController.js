const Validation = require("../../User/Validation");
const adminUserModel = require("./AdminUserModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Randomstring = require("randomstring");
const Send = require("../SendOPT/OTP");
const nodemailer = require("nodemailer")


const Transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "tarunrudakiya123@gmail.com",
    pass: process.env.EMAIL_PASSWORD,
  },
});

class AdminUserController {
  async CreateAdminUser(req, res) {
    try {
      let user = req.body;

      const ValidationResult = Validation(req.body, "AdminUser");

      if (ValidationResult.length > 0) {
        return res.status(400).send({
          message: "Validation Error",
          ValidationResult: ValidationResult,
        });
      }

      const EncodePassword = bcrypt.hashSync(user.password, 8);

      if (!EncodePassword) {
        return res.status(500).send({ message: "Somthing Went Wrong" });
      }
      user.password = EncodePassword;

      const token = jwt.sign({ ...user }, process.env.JWT_SECRATE, {
        expiresIn: "30d",
      });

      if (!token)
        return res.status(500).send({ message: "Somthing Went Wrong" });

      user = { ...user, token: token };

      const result = await adminUserModel.create(user);

      if (!result)
        return res.status(400).send({ message: "Somthing Went Wrong" });

      user = result._doc;

      delete user.password;

      return res
        .status(200)
        .send({ message: "Success", user: { ...user, token: token } });
    } catch (error) {
      console.log(error);
      if (error && error.message && error.message.includes("E11000")) {
        return res.status(400).send({
          message: "Valiodation Error",
          ValidationResult: [{ key: "email", message: "email Alredy Exist" }],
        });
      }
      return res.status(500).send({ message: "Internal Server Error" });
    }
  }

  async AdminLogin(req, res) {
    try {
      const { email, password } = req.body;

      // Validate request body
      const ValidationResult = Validation(req.body, "login");

      if (ValidationResult.length > 0) {
        return res
          .status(400)
          .json({ message: "Validation Error", errors: ValidationResult });
      }

      // Generate OTP
      const otp = Randomstring.generate({
        charset: "numeric",
        length: 6,
      });

      const hashedOtp = bcrypt.hashSync(otp, 8);

      // Prepare user data
      const UserData = {
        email,
        password,
        otp: hashedOtp,
      };

      // Send OTP via email
      const mailOptions = {
        from: "tarunrudakiya123@gmail.com",
        to: UserData.email,
        subject: "Oil Pixcel Login OTP",
        html: `<p>Dear User, your One Time Password is: <strong>${otp}</strong></p>`,
      };

      const sendMail = await Send(mailOptions);

      if (!sendMail || sendMail !== "OK") {
        return res.status(400).json({ message: "Failed to send OTP" });
      }

      // Check if user exists
      let user = await adminUserModel.findOne({ email: UserData.email });

      if (!user) {
        return res.status(400).json({
          message: "Validation Error",
          errors: [{ key: "email", message: "Email not found" }],
        });
      }

      // Update OTP for the user
      await adminUserModel.updateOne(
        { email: UserData.email },
        { otp: hashedOtp }
      );

      // Validate password
      if (!bcrypt.compareSync(password, user.password)) {
        return res.status(400).json({
          message: "Validation Error",
          errors: [{ key: "password", message: "Incorrect password" }],
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        { id: user._id, email: user.email },
        process.env.JWT_SECRET,
        {
          expiresIn: "30d",
        }
      );

      // Remove sensitive data before sending response
      const userResponse = { ...user.toObject() };
      delete userResponse.password;
      delete userResponse.otp;

      // Send success response
      return res
        .status(200)
        .json({ message: "Success", user: { ...userResponse, token } });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }

  async OtpVerfy(req, res) {
    try {
      const { otp, email } = req.body;

      if (!otp)
        return res.status(400).send({ message: "Missing Dependency Otp" });

      if (!email)
        return res.status(400).send({ message: "Missing Dependency Email" });

      const user = await adminUserModel.findOne({ email });

      if (!user) {
        return res.status(404).send({ message: "User not found" });
      }
      const isOtpValid = await bcrypt.compare(otp, user.otp);

      if (isOtpValid) {
        return res.status(200).send({ message: "OTP verification successful" });
      } else {
        return res.status(400).send({
          message: "Valiodation Error",
          ValidationResult: [{ key: "otp", message: "Invalid OTP" }],
        });
      }
    } catch (error) {
      console.log(error);
      return res.status(500).send({ message: "Internal Server Error" });
    }
  }

  async GetAdminUser(req, res) {
    try {
      const result = await adminUserModel.find({});

      if (!result)
        return res.status(400).send({ message: "Somthing Went Wrog" });

      return res.status(200).send({ message: "Success", user: result });
    } catch (error) {
      console.log(error);
      return res.status(500).send({ message: "Internal Server Error" });
    }
  }

  async DeleUser(req, res) {
    try {
      const { id } = req.params;
      const result = await adminUserModel.deleteOne({ _id: id });
      if (result) return res.status(200).send({ message: "Success", result });
      return res.status(400).send({ message: "Somthing Went Wrong" });
    } catch (error) {
      return res.status(400).send({ message: "Internal Server Error" });
    }
  }

  async UpdateUser(req, res) {
    try {
      const { id } = req.params;
      const body = req.body;
      const result = await adminUserModel.updateOne({ _id: id }, body);
      if (result.modifiedCount > 0 || result.matchedCount > 0) {
        return res.status(200).send({ message: "Success", result });
      }
      return res.status(400).send({ message: "Somthing Wentn Wrong" });
    } catch (error) {
      console.log(error);
      return res.status(500).send({ message: "Interbal Server Error" });
    }
  }
}

const adminUserController = new AdminUserController();
module.exports = adminUserController;
