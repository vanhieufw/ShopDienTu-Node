function requireLogin(req, res, next) {
  if (!req.session.user_id) return res.redirect('/login');
  next();
}
function requireAdmin(req, res, next) {
  if (!req.session.user_id || Number(req.session.RoleUser) !== 1) return res.redirect('/login');
  next();
}
module.exports = { requireLogin, requireAdmin };
