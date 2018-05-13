var auth = require('../controllers/auth');

module.exports = {
  configure: function (app) {
    app.route('/auth/login').post(auth.login);
    app.route('/auth/forgot-password').post(auth.forgotPassword);
    app.route('/auth/password-reset/:token').get(auth.passwordReset);
    app.route('/auth/password-reset').post(auth.passwordResetPost);
  }
};
//# sourceMappingURL=auth.js.map
