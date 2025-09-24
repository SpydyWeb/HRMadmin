const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const proxyRoutes = require("./routes/proxyRoutes");
const { encryptionService } = require("./services/encryptionService");

const app = express();

app.use(cors());
app.use(bodyParser.json());

// Routes
app.use("/api", proxyRoutes);
app.get("/", (req, res) => {
  res.send("Welcome to the Secure Proxy Server . Visit /api-docs for API documentation.");
});
app.get("/getHRMChunks", (req, res) => {
  res.json({ HRMChunks: encryptionService.getHrm_Key() });
});


module.exports = app;
