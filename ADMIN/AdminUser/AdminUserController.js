const Validation = require("../../User/Validation");
const adminUserModel = require("./AdminUserModel");
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
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
          user: "jadavpratik743@gmail.com",
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
        from: "jadavpratik743@gmail.com",
        to: email,
        subject: "Oil Pixcel Login OTP",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; background-color: #f9f9f9;">
            <div style="text-align: center; padding-bottom: 20px;">
              <img src="https://oil-pixcel-static-website.vercel.app/logo.png" alt="Oil Pixcel Logo" style="max-width: 150px; margin-bottom: 20px;">
            </div>
      
            <div style="background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
              <h2 style="color: #333; text-align: center;">Oil Pixcel Login OTP</h2>
              <p style="font-size: 16px; color: #555; text-align: center;">
                Dear User,<br>
                Please use the following One Time Password (OTP) to login to your Oil Pixcel account:
              </p>
      
              <div style="text-align: center; margin: 30px 0;">
                <span style="display: inline-block; font-size: 32px; padding: 15px 30px; background-color: #FFA500; color: white; border-radius: 5px; letter-spacing: 4px;">
                  ${otp}
                </span>
              </div>
      
              <p style="font-size: 16px; color: #555; text-align: center;">
                This OTP is valid for the next 10 minutes. Please do not share this code with anyone for your account’s security.
              </p>
            </div>
      
            <div style="text-align: center; padding: 20px 0; color: #777;">
              <p style="font-size: 14px;">
                If you did not request this OTP, please contact us immediately at <a href="mailto:tarunrudakiya123@gmail.com" style="color: #FFA500; text-decoration: none;">tarunrudakiya123@gmail.com</a>.
              </p>
              <p style="font-size: 12px; color: #999;">
                © 2024 Oil Pixcel By Tarun Rudakiya. All rights reserved.
              </p>
            </div>
          </div>
        `,
      };

      // Send OTP via email
      const mailResponse = await transporter.sendMail(mailOptions);
      if (!mailResponse || mailResponse.accepted.length === 0) {
        return res.status(400).json({ message: "Failed to send OTP" });
      }

      // Generate JWT token
  

      const token = jwt.sign({ id: user._id, email: user.email },  process.env.JWT_SECRET, { expiresIn: '10d' });


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
      return res.status(500).json({ message: "Login----Internal Server Error" });
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
