const express = require("express");
const { encryptionService } = require("../services/encryptionService");
const { isEncryptionEnabled } = require("../config/encryptionConfig");
const e = require("express");
const router = express.Router();
const apiService = require("../services/apiService");

router.post("/proxy", async (req, res) => {
  try {
    const encryptionEnabled = isEncryptionEnabled();
    let decryptedBody;
    if (encryptionEnabled && req.body.requestEncryptedString) {
      decryptedBody = encryptionService.decryptObject(
        req.body.requestEncryptedString
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
      res.setHeader('Content-Type', 'application/octet-stream');
      res.setHeader('Content-Disposition', 'attachment');
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
