const jwt = require('jsonwebtoken');

const blacklist = new Map(); // token -> expiresAt (ms timestamp)

const addTokenToBlacklist = (token) => {
  if (!token) return;
  try {
    const decoded = jwt.decode(token);
    if (decoded && decoded.exp) {
      // exp is in seconds, convert to milliseconds
      const expiresAt = decoded.exp * 1000;
      // Only store if token is not already expired
      if (expiresAt > Date.now()) {
        blacklist.set(token, expiresAt);
      }
    }
  } catch (err) {
    console.error('[blacklist] Không thể giải mã token:', err.message);
  }
};

const isTokenBlacklisted = (token) => {
  if (!token) return false;
  const expiresAt = blacklist.get(token);
  if (!expiresAt) return false;
  if (Date.now() > expiresAt) {
    blacklist.delete(token); // Cleanup on the fly
    return false;
  }
  return true;
};

// Clean up expired tokens every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [token, expiresAt] of blacklist.entries()) {
    if (now > expiresAt) {
      blacklist.delete(token);
    }
  }
}, 5 * 60 * 1000);

module.exports = {
  addTokenToBlacklist,
  isTokenBlacklisted
};
