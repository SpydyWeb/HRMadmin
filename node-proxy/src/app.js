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

// Specific routes BEFORE middleware that catches all /api routes
app.post('/api/file', upload.fields([{ name: 'File' }, { name: 'FileType' }]), async (req, res) => {
  try {
    console.log('📁 /api/file endpoint hit');
    console.log('Files received:', req.files?.File?.length || 0);
    console.log('FileType:', req.body?.FileType);
    
    // Validate file exists
    if (!req.files?.File || req.files.File.length === 0) {
      console.error('❌ No file provided');
      return res.status(400).json({ error: 'No file provided' });
    }
    
    const FormData = require('form-data');
    const formData = new FormData();
    
    // Add files to FormData
    for (const file of req.files.File) {
      console.log(`Adding file: ${file.originalname} (${file.size} bytes)`);
      formData.append('File', file.buffer, file.originalname);
    }
    
    // Add FileType if provided
    const fileType = req.body?.FileType;
    if (fileType) {
      formData.append('FileType', fileType);
      console.log(`Adding FileType: ${fileType}`);
    }
    
    // Prepare headers - merge FormData headers with auth
    const headers = {
      ...formData.getHeaders(),
    };
    
    if (req.headers.authorization) {
      headers.authorization = req.headers.authorization;
      console.log('✓ Forwarding Authorization header');
    }
    
    console.log('Headers being sent:', Object.keys(headers));
    console.log('Calling apiService.file()');
    const result = await apiService.file(formData, { headers });
    
    if (!result) {
      return res.status(500).json({ error: 'API returned empty response' });
    }
  
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message || String(err) });
  }
});

console.log("File endpoint configured");

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
