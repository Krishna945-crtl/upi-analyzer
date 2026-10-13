// 🧯 Express 4 async errors catch cheyyadu — ee wrapper next(err) ki pampistundi
module.exports = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)
