var video = require('../controllers/video');

module.exports = {
  configure: function (app) {
    app.route('/video/list').get(video.list);
    app.route('/video/detail/:id').get(video.detail);
    app.route('/video/post').post(video.post);
    app.route('/video/update').post(video.update);
    app.route('/video/delete').post(video.delete);
  }
};
//# sourceMappingURL=video.js.map
