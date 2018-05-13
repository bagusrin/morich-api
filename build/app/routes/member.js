var member = require('../controllers/member');

module.exports = {
  configure: function (app) {
    app.route('/member/potential').get(member.potential);
    app.route('/member/active').get(member.active);
    app.route('/member/activated').post(member.activated);
    app.route('/member/ranking').get(member.ranking);
  }
};
//# sourceMappingURL=member.js.map
