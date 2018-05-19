var user = require('../controllers/user');
var multer = require('multer');

var storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/users');
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + '-' + Date.now());
  }
});

var upload = multer({ storage: storage });

module.exports = {
  configure: function (app) {
    app.route('/user/register').post(user.userRegister);
    app.route('/user/join').post(user.userJoin);
    app.route('/user/update').post(user.userUpdate);
    app.route('/user/detail/:id').get(user.userDetail);
    app.route('/user/username/:username').get(user.userDetailByUsername);
    app.route('/user/id/get').get(user.userGetIdByEmail);
    app.route('/user/uploadphoto').post(user.uploadAction, user.userUploadPhoto);
  }
};
//# sourceMappingURL=user.js.map
