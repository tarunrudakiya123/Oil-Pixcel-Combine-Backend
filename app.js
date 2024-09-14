const express = require("express");
const cors = require("cors");
const path = require("path");
const dotenv = require("dotenv");
const AdminRouter = require("./ADMIN/AdminRouter");
const ConnecionDb = require("./Connection");
const bodyParser = require('body-parser');

dotenv.config();

const app = express();


const Port = process.env.PORT;
ConnecionDb();

// CORS configuration
const allowedOrigins = [
  process.env.REACT_APP_ADMINPANEL_FRONTEND_URL,
  process.env.REACT_APP_WEBSITE_FRONTEND_URL,
];

// app.use(
//   cors({
//     origin: function (origin, callback) {
//       console.log("Incoming Origin:", origin);

//       if (!origin || allowedOrigins.includes(origin)) {
//         callback(null, true);
//       } else {
//         callback(new Error("Not allowed by CORS"));
//       }
//     },
//     methods: ["GET", "POST", "PUT", "DELETE"],
//     allowedHeaders: ["Content-Type", "Authorization"],
//     preflightContinue: false,
//     optionsSuccessStatus: 200,
//   })
// );

app.use(
  cors({
    origin: function (origin, callback) {
      console.log("Incoming Origin:", origin);

      // Allow requests without an origin (like same-origin requests or non-browser clients)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    preflightContinue: false,
    optionsSuccessStatus: 200,
  })
);

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
app.listen(Port, () => {
  console.log(`Server is started for serving on port ${Port}`);
});
