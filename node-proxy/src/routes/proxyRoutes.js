const express = require("express");
const apiService = require("../services/apiService");
const { encryptionService } = require("../services/encryptionService");
const router = express.Router();

router.post("/proxy", async (req, res) => {
  try {
    const decryptedBody = req.body.requestEncryptedString
      ? encryptionService.decryptObject(req.body.requestEncryptedString)
      : req.body;
    const { fn, args = [], headers = {} } = decryptedBody;
    console.log(fn,args,apiService);
    
    if (!fn || typeof apiService[fn] !== "function") {
      return res.status(400).json({ error: "Invalid function name" });
    }
    const result = await apiService[fn](...args, headers);
    console.log('====================================');
    console.log(result);
    console.log('====================================');
     const safeData = { ...result };
    let ciphertextResp = encryptionService.encryptObject(safeData);
    return res.json({ responseEncryptedString: ciphertextResp });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message || String(err) });
  }
});

module.exports = router;
