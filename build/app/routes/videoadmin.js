var video = require('../controllers/videoadmin');

module.exports = {
  configure: function (app) {
    app.route('/video/admin/list').get(video.list);
    app.route('/video/admin/list-slider').get(video.listSlider);
    app.route('/video/admin/list_').get(video.listAdmin);
    app.route('/video/admin/detail/:id').get(video.detail);
    app.route('/video/admin/post').post(video.post);
    app.route('/video/admin/update').post(video.update);
    app.route('/video/admin/delete').post(video.delete);
    app.route('/video/admin/publish').post(video.publish);

    app.route('/video/learning/list').get(video.vlist);
    app.route('/video/learning/list-slider').get(video.vlistSlider);
    app.route('/video/learning/list_').get(video.vlistAdmin);
    app.route('/video/learning/detail/:id').get(video.vdetail);
    app.route('/video/learning/post').post(video.vpost);
    app.route('/video/learning/update').post(video.vupdate);
    app.route('/video/learning/delete').post(video.vdelete);
    app.route('/video/learning/publish').post(video.vpublish);
  }
};
//# sourceMappingURL=videoadmin.js.map
