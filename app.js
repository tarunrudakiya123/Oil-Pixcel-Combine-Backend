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



const allowedOrigins = [
  'https://oil-pixcel-admin-panel-f9w7.vercel.app',
  'https://oil-pixcel-static-website.vercel.app'
];

// Configure CORS
App.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      // Allow requests with no origin or requests from the allowed origins
      callback(null, true);
    } else {
      // Reject requests from disallowed origins
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));


App.use(cors());

App.use(json());

ConnecionDb();

// App.use("/uploads", express.static("./uploads"));
App.use("/uploads", express.static(path.join(__dirname, "/ADMIN/uploads")));

App.get("/", (req, res) => {
  return res.status(200).send({ message: "Suceess" });
});

App.get("/product", productController.GetProduct);

App.get("/product/:id", productController.GetProductById);

App.post("/register", userController.RegisterUser);

App.post("/login", userController.UserLogin);

App.post("/cart", productController.GetCart);

App.post(
  "/neworder",
  authController.CreatOrderAuth,
  orderController.CreateOrder
);

App.get("/order", authController.CreatOrderAuth, orderController.GetOrder);

App.get(
  "/order/:id",
  authController.CreatOrderAuth,
  orderController.getOrderByID
);

App.post(
  "/payment/verify",
  authController.CreatOrderAuth,
  orderController.PaymentVerify
);

// App.get("/product/insert/many", productController.InserProduct)

/////////// ADMIN API////////////

App.use("/admin", AdminRouter);
const options = {
  key: fs.readFileSync("Certification/key.pem"),
  cert: fs.readFileSync("Certification/cert.pem"),
};

const server = https.createServer(options, App);

server.listen(process.env.PORT, () => {
  console.log("Server Is Started For Serving");
});
