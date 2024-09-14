const express = require("express");
const ConnecionDb = require("./Connection");
const cors = require("cors");
const productController = require("./Product/ProductController");
const userController = require("./User/UserController");
const { json } = require("express");
const authController = require("./Auth/Auth");
const orderController = require("./Order/OrderController");
const fileUpload = require("express-fileupload");
const AdminRouter = require("./ADMIN/AdminRouter");
require("dotenv").config();
const https = require("https");
const fs = require("fs");
const path = require("path");
const Cookie = require("cookie-parser");

const App = express();

// Log environment variables
console.log('Admin Panel URL:', process.env.REACT_APP_ADMINPANEL_FRONTEND_URL);
console.log('Website URL:', process.env.REACT_APP_WEBSITE_FRONTEND_URL);

App.use(json());
ConnecionDb();

const allowedOrigins = [
  process.env.REACT_APP_ADMINPANEL_FRONTEND_URL,
  process.env.REACT_APP_WEBSITE_FRONTEND_URL,
];

// Configure CORS
App.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    preflightContinue: false,
    optionsSuccessStatus: 204, // For legacy browser support
  })
);

/////////// ADMIN API////////////

App.use("/admin", AdminRouter);

const options = {
  key: fs.readFileSync("Certification/key.pem"),
  cert: fs.readFileSync("Certification/cert.pem"),
};

// Serve static files
App.use("/uploads", express.static(path.join(__dirname, "/ADMIN/uploads")));

App.get("/", (req, res) => {
  return res.status(200).send({ message: "Success" });
});

App.get("/product", productController.GetProduct);
App.get("/product/:id", productController.GetProductById);
App.post("/register", userController.RegisterUser);
App.post("/login", userController.UserLogin);
App.post("/cart", productController.GetCart);
App.post("/neworder", authController.CreatOrderAuth, orderController.CreateOrder);
App.get("/order", authController.CreatOrderAuth, orderController.GetOrder);
App.get("/order/:id", authController.CreatOrderAuth, orderController.getOrderByID);
App.post("/payment/verify", authController.CreatOrderAuth, orderController.PaymentVerify);

const server = https.createServer(options, App);

server.listen(process.env.PORT, () => {
  console.log("Server is started for serving on port", process.env.PORT);
});
