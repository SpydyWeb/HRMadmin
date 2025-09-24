require("dotenv").config();

module.exports = {
  PORT: process.env.PORT || 5000,
  DOTNET_API_URL: process.env.DOTNET_API_URL,
  ENCRYPTION_KEY: process.env.ENCRYPTION_KEY, // Example: 32-char key for AES
  ENCRYPTION_IV: process.env.ENCRYPTION_IV,   // Example: 16-char IV
};
