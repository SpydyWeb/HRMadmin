const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const multer = require("multer");
const proxyRoutes = require("./routes/proxyRoutes");
const { encryptionService } = require("./services/encryptionService");
const { getHRMChunks } = require("./services/apiService");
const apiService = require("./services/apiService");

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());
app.use(bodyParser.json());

console.log("Setting up /api/file endpoint");


// Home page
app.get("/", (req, res) => {
  res.send("Welcome to the Secure Proxy Server . Visit /api-docs for API documentation.");
});

// Encryption chunks endpoint
app.get("/getHRMChunks", (req, res) => {
  const data = getHRMChunks();
  res.json(data);
});

// General API proxy routes (must be last to avoid shadowing specific routes)
console.log("Setting up /api proxy routes");
app.use("/api", proxyRoutes);
console.log("Proxy routes configured");


module.exports = app;
