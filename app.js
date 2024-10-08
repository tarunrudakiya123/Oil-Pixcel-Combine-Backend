const express = require("express");
const cors = require("cors");
const path = require("path");
const env = require("dotenv").config();
const AdminRouter = require("./ADMIN/AdminRouter");
const ConnecionDb = require("./Connection");
const bodyParser = require("body-parser");
const https = require("https");
const fs = require("fs");

const app = express();


const allowedOrigins = [
  process.env.REACT_APP_ADMINPANEL_FRONTEND_URL,
  process.env.REACT_APP_WEBSITE_FRONTEND_URL,
];

app.use(
  cors({
    origin: function (origin, callback) {
      console.log("Incoming Origin:", origin);

      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.error(`Blocked by CORS: ${origin}`);
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true, // Allows sending cookies or Authorization headers
    optionsSuccessStatus: 200, // Response to preflight requests
  })
);





const Port = process.env.PORT || 3000;
ConnecionDb();

// CORS configuration



app.use(bodyParser.json({ limit: "200mb" }));
app.use(bodyParser.urlencoded({ limit: "300mb", extended: true }));

app.use("/admin", AdminRouter);

// Serve static files
app.use("/uploads", express.static(path.join(__dirname, "/ADMIN/uploads")));

// Route
app.get("/", (req, res) => res.status(200).send({ message: "Success" }));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({ error: "Something went wrong!" });
});

// Start server

const options = {
  key: fs.readFileSync("Certification/key.pem"),
  cert: fs.readFileSync("Certification/cert.pem"),
  // passphrase: "jadav12345"
};

const server = https.createServer(options, app);

server.listen(Port, () => {
  console.log(`Server Is Started For Serving ${Port}`);
});
