// config/encryptionConfig.js
let encryptionEnabled = true // default

module.exports = {
  isEncryptionEnabled: () => encryptionEnabled,
  setEncryptionEnabled: (enabled) => {
    encryptionEnabled = enabled
  }
}
