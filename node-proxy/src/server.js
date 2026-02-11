const express = require("express");
const bodyParser = require("body-parser");
const helmet = require("helmet");
const path = require("path");
const fs = require("fs");
const cluster = require("cluster");
const os = require("os");
const compression = require("compression");
const morgan = require("morgan");
const multer = require("multer");
const config = require("./config");
const { encryptionService } = require("./services/encryptionService");
const apiService = require("./services/apiService");
const apiRoutes = require("./routes/proxyRoutes");

const numCPUs = os.cpus().length;

  const app = express();
  app.set('trust proxy', 1);

  // Security Middleware
  app.use(helmet({
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }));

  app.use(
    helmet.contentSecurityPolicy({
      useDefaults: true,
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:"],
        connectSrc: [
          "'self'",
          ...config.cors.allowedOrigins,
        ],
        objectSrc: ["'none'"],
        frameAncestors: ["'none'"],
        upgradeInsecureRequests: [],
      },
    })
  );

  app.use((req, res, next) => {
    res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    next();
  });

  // CORS Configuration
  app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (config.cors.allowedOrigins.includes(origin)) {
      res.setHeader("Access-Control-Allow-Origin", origin);
    }
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization, x-user-token");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    if (req.method === "OPTIONS") {
      return res.sendStatus(200);
    }
    next();
  });

  // Logging & Performance
  app.use(morgan("combined"));
  app.use(compression());

  // Body Parser
  app.use(bodyParser.json({ limit: config.jsonBodyLimit }));
  app.use(bodyParser.urlencoded({ limit: config.jsonBodyLimit, extended: true }));

  // Uploads Directory
  const uploadsPath = path.join(__dirname, "../uploads");
  if (!fs.existsSync(uploadsPath)) {
    fs.mkdirSync(uploadsPath, { recursive: true });
  }

  // Multer setup for file uploads
  const upload = multer({ storage: multer.memoryStorage() });

  // File Upload Endpoint - MUST be before the generic /api routes
  console.log("🔧 Setting up /api/file endpoint");
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
        const authHeader = Array.isArray(req.headers.authorization) 
          ? req.headers.authorization[0] 
          : String(req.headers.authorization);
        headers.authorization = authHeader;
        console.log('✓ Forwarding Authorization header (file endpoint)');
      }
      
      console.log('Headers being sent:', Object.keys(headers));
      console.log('Calling apiService.file()');
      const result = await apiService.file(formData, { headers });
      
      console.log('Result from apiService.file():', JSON.stringify(result, null, 2));
      
      if (!result || (typeof result === 'string' && result.length === 0)) {
        console.error('❌ apiService.file() returned empty or null response:', result);
        console.error('Error might be in the request itself or API response format');
        return res.status(500).json({ error: 'API returned empty response', result });
      }
      
      console.log('✅ File upload successful:', result);
      res.json(result);
    } catch (err) {
      console.error('❌ File upload error:', err);
      res.status(500).json({ error: err.message || String(err) });
    }
  });

  // Alias endpoint for backward compatibility
  console.log("🔧 Setting up /api/upload endpoint (alias for /api/file)");
  app.post('/api/upload', upload.fields([{ name: 'File' }, { name: 'FileType' }]), async (req, res) => {
    try {
      console.log('📁 /api/upload endpoint hit');
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
        const authHeader = Array.isArray(req.headers.authorization) 
          ? req.headers.authorization[0] 
          : String(req.headers.authorization);
        headers.authorization = authHeader;
        console.log('✓ Forwarding Authorization header (upload endpoint)');
      }
      
      console.log('Headers being sent:', Object.keys(headers));
      console.log('Calling apiService.file()');
      const result = await apiService.file(formData, { headers });
      
      console.log('Result from apiService.file():', JSON.stringify(result, null, 2));
      
      if (!result || (typeof result === 'string' && result.length === 0)) {
        console.error('❌ apiService.file() returned empty or null response:', result);
        console.error('Error might be in the request itself or API response format');
        return res.status(500).json({ error: 'API returned empty response', result });
      }
      
      console.log('✅ File upload successful:', result);
      res.json(result);
    } catch (err) {
      console.error('❌ File upload error:', err);
      res.status(500).json({ error: err.message || String(err) });
    }
  });

  // Routes
  app.use("/api", apiRoutes);


  app.get("/getHRMChunks", (req, res) => {
    res.json(apiService.getHRMChunks());
  });

  app.get("/", (req, res) => {
    res.send("Secure Proxy Server Running — All security headers are applied correctly.");
  });


  // Start Server
  const server = app.listen(config.port, "0.0.0.0", () => {
    console.log(`Worker ${process.pid} started on port ${config.port}`);
  });

  // Global Error Handler
  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: "Internal Server Error" });
  });


