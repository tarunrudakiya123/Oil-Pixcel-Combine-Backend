const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const https = require("https");
const dotenv = require("dotenv");
dotenv.config();

const App = express();

App.use(express.json());

const allowedOrigins = [
  process.env.REACT_APP_ADMINPANEL_FRONTEND_URL,
  process.env.REACT_APP_WEBSITE_FRONTEND_URL,
];

App.use(
  cors({
    origin: function (origin, callback) {
      console.log("Incoming Origin:", origin); // Log origin for debugging
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    preflightContinue: false,
    optionsSuccessStatus: 200, // For legacy browser support
  })
);

const options = {
  key: fs.readFileSync("Certification/key.pem"),
  cert: fs.readFileSync("Certification/cert.pem"),
};

App.use("/uploads", express.static(path.join(__dirname, "/ADMIN/uploads")));

App.get("/", (req, res) => res.status(200).send({ message: "Success" }));

const server = https.createServer(options, App);

server.listen(process.env.PORT, () => {
  console.log(`Server is started for serving on port ${process.env.PORT}`);
});
