// config/encryptionConfig.js
let encryptionEnabled = false // default

module.exports = {
  isEncryptionEnabled: () => encryptionEnabled,
  setEncryptionEnabled: (enabled) => {
    encryptionEnabled = enabled
  }
}
