var video = require('../controllers/videoadmin');
 
module.exports = {
  configure: function(app) {
    app.route('/video/admin/list').get(video.list);
    app.route('/video/admin/list-slider').get(video.listSlider);
    app.route('/video/admin/list_').get(video.listAdmin);
    app.route('/video/admin/detail/:id').get(video.detail);
    app.route('/video/admin/post').post(video.post);
    app.route('/video/admin/update').post(video.update);
    app.route('/video/admin/delete').post(video.delete);
    app.route('/video/admin/publish').post(video.publish);
  }
};