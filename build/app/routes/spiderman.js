var spiderman = require('../controllers/spiderman');

module.exports = {
  configure: function (app) {
    app.route('/admin/list').get(spiderman.spidermanList);
    app.route('/admin/detail/:id').get(spiderman.spidermanDetail);
    app.route('/admin/register').post(spiderman.spidermanRegister);
    app.route('/admin/login').post(spiderman.spidermanLogin);
    app.route('/admin/dashboard').get(spiderman.spidermanDashboard);
  }
};
//# sourceMappingURL=spiderman.js.map
