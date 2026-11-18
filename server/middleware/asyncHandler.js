// Forwards rejected promises to Express error handling (Express 4 needs this)
module.exports = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
