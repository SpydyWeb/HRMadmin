const express = require("express");
const bodyParser = require("body-parser");
const helmet = require("helmet");
const path = require("path");
const fs = require("fs");
const cluster = require("cluster");
const os = require("os");
const compression = require("compression");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const config = require("./config");
const { encryptionService } = require("./services/encryptionService");
const apiRoutes = require("./routes/proxyRoutes");

const numCPUs = os.cpus().length;

if (cluster.isMaster) {
  console.log(`Master ${process.pid} is running`);

  // Fork workers.
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on("exit", (worker, code, signal) => {
    console.log(`worker ${worker.process.pid} died`);
    // Restart the worker
    cluster.fork();
  });
} else {
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

  // Rate Limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  });
  app.use(limiter);


  // Body Parser
  app.use(bodyParser.json({ limit: config.jsonBodyLimit }));
  app.use(bodyParser.urlencoded({ limit: config.jsonBodyLimit, extended: true }));

  // Uploads Directory
  const uploadsPath = path.join(__dirname, "../uploads");
  if (!fs.existsSync(uploadsPath)) {
    fs.mkdirSync(uploadsPath, { recursive: true });
  }

  // Routes
  app.use("/api", apiRoutes);

  app.post("/getOasisChunks", (req, res) => {
    res.json({ OasisChunks: encryptionService.getOasis_Key() });
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

  // Graceful Shutdown
  const gracefulShutdown = () => {
    console.log(`Worker ${process.pid} received kill signal, shutting down gracefully`);
    server.close(() => {
      console.log(`Worker ${process.pid} closed remaining connections`);
      process.exit(0);
    });

    // Force close server after 10 seconds
    setTimeout(() => {
      console.error(`Worker ${process.pid} could not close connections in time, forcefully shutting down`);
      process.exit(1);
    }, 10000);
  };

  process.on("SIGTERM", gracefulShutdown);
  process.on("SIGINT", gracefulShutdown);
}
