// Utility: centralized info/error logging helpers used across backend modules.

function info(message, meta = {}) {
  console.log(`[INFO] ${new Date().toISOString()} - ${message}`, meta);
}

function error(message, meta = {}) {
  console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, meta);
}

module.exports = {
  info,
  error
};


