const express = require("express");
const { encryptionService } = require("../services/encryptionService");
const { isEncryptionEnabled } = require("../config/encryptionConfig");
const e = require("express");
const router = express.Router();
const apiService = require("../services/apiService");

// Node utilities used by the upload handler
const fs = require("fs");
const os = require("os");
const { formidable } = require("formidable");
const FormData = require("form-data");

router.post("/upload", (req, res) => {
  const form = formidable({
    multiples: false,
    uploadDir: os.tmpdir(),
    keepExtensions: true,
  });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(400).json({ error: "Invalid multipart request" });
    }

    try {
      const encryptionEnabled = isEncryptionEnabled();
      let decryptedMeta = {};
      if (encryptionEnabled && fields.requestEncryptedString) {
        let encrypted = fields.requestEncryptedString;
        if (Array.isArray(encrypted)) encrypted = encrypted[0];

        decryptedMeta = encryptionService.decryptObject(encrypted);
      } else {
        // Plain mode
        decryptedMeta = {
          fn: fields.fn,
          headers: {},
        };
      }

      const { fn, headers = {} } = decryptedMeta;

      if (!fn || typeof apiService[fn] !== "function") {
        return res.status(400).json({ error: `Invalid fn: ${fn}` });
      }
      let fileObj = files.File;
      if (Array.isArray(fileObj)) fileObj = fileObj[0];

      if (!fileObj) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const tempPath = fileObj.filepath;
      const originalName = fileObj.originalFilename;
      let fileType = fields.FileType;
      if (Array.isArray(fileType)) fileType = fileType[0];
      const forwardForm = new FormData();
      forwardForm.append("File", fs.createReadStream(tempPath), originalName);
      forwardForm.append("FileType", fileType || "");

      // Merge multipart headers properly
      const forwardHeaders = {
        ...headers,
        ...forwardForm.getHeaders(),
      };

      // Forward Authorization header if present in request
      if (req.headers.authorization) {
        forwardHeaders["Authorization"] = req.headers.authorization;
      }
      const result = await apiService[fn](forwardForm, forwardHeaders);

      fs.unlink(tempPath, () => {});
      if (encryptionEnabled) {
        const ciphertextResp = encryptionService.encryptObject(result);
        return res.json({ responseEncryptedString: ciphertextResp });
      }

      return res.json(result);
    } catch (error) {
      console.error("Upload Proxy Error:", error);
      return res.status(500).json({ error: error.message });
    }
  });
});

router.post("/proxy", async (req, res) => {
  try {
    const encryptionEnabled = isEncryptionEnabled();
    let decryptedBody;
    if (encryptionEnabled && req.body.requestEncryptedString) {
      decryptedBody = encryptionService.decryptObject(
        req.body.requestEncryptedString,
      );
    } else {
      decryptedBody = req.body;
    }
    const { fn, args = [], headers = {} } = decryptedBody;

    if (!fn || typeof apiService[fn] !== "function") {
      return res.status(400).json({ error: `Invalid function name: ${fn}` });
    }
    const result = await apiService[fn](...args, headers);

    // Handle blob responses (file downloads) - Buffer in Node.js
    if (Buffer.isBuffer(result) || result instanceof Uint8Array) {
      // Set appropriate headers for file download
      res.setHeader("Content-Type", "application/octet-stream");
      res.setHeader("Content-Disposition", "attachment");
      return res.send(result);
    }

    const safeData = { ...result };

    if (encryptionEnabled) {
      const ciphertextResp = encryptionService.encryptObject(safeData);
      return res.json({ responseEncryptedString: ciphertextResp });
    }
    return res.json(safeData);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message || String(err) });
  }
});

module.exports = router;
