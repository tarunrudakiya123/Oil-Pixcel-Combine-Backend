const express = require("express");
const cors = require("cors");
const path = require("path");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

// Middleware to parse JSON
app.use(express.json());

// CORS configuration
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
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    preflightContinue: false,
    optionsSuccessStatus: 200, 
  })
);

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
const port = process.env.PORT || 3000; 
app.listen(port, () => {
  console.log(`Server is started for serving on port ${port}`);
});
