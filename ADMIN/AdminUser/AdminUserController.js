const Validation = require("../../User/Validation");
const adminUserModel = require("./AdminUserModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Randomstring = require("randomstring");
const nodemailer = require("nodemailer");

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
    const { email, password } = req.body;

    try {
      // Setup Nodemailer transport
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: "tarunrudakiya123@gmail.com",
          pass: process.env.EMAIL_PASSWORD,
        },
      });

      // Validate the request body
      const validationErrors = Validation(req.body, "login");
      if (validationErrors.length > 0) {
        return res.status(400).json({
          message: "Validation Error",
          errors: validationErrors,
        });
      }

      // Generate OTP and hash it
      const otp = Randomstring.generate({ charset: "numeric", length: 6 });
      const hashedOtp = bcrypt.hashSync(otp, 8);

      // Find the user by email
      const user = await adminUserModel.findOne({ email });

      if (!user) {
        return res.status(400).json({
          message: "Validation Error",
          errors: [{ key: "email", message: "Email not found" }],
        });
      }

      // Validate password
      const isPasswordValid = bcrypt.compareSync(password, user.password);
      if (!isPasswordValid) {
        return res.status(400).json({
          message: "Validation Error",
          errors: [{ key: "password", message: "Incorrect password" }],
        });
      }

      // Update the user's OTP in the database
      await adminUserModel.updateOne({ email }, { otp: hashedOtp });

      // Prepare email options
      const mailOptions = {
        from: "tarunrudakiya123@gmail.com",
        to: email,
        subject: "Oil Pixcel Login OTP",
        html: `<p>Dear User, your One Time Password is: <strong>${otp}</strong></p>`,
      };

      // Send OTP via email
      const mailResponse = await transporter.sendMail(mailOptions);
      if (!mailResponse || mailResponse.accepted.length === 0) {
        return res.status(400).json({ message: "Failed to send OTP" });
      }

      // Generate JWT token
      const token = jwt.sign(
        { id: user._id, email: user.email },
        process.env.JWT_SECRET,
        {
          expiresIn: "30d",
        }
      );

      // Remove sensitive data before sending the response
      const userResponse = user.toObject();
      delete userResponse.password;
      delete userResponse.otp;

      // Send success response
      return res.status(200).json({
        message: "Success",
        user: { ...userResponse, token },
      });
    } catch (error) {
      console.error("Error in AdminLogin:", error);
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
