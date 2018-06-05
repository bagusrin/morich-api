var connection = require('../../../config/db');

var jwt = require('jsonwebtoken'),
    bcrypt = require('bcrypt'),
    userModel = require('../models/user'),
    cfg = require('../../../config');

function cMember() {
  this.potential = function (req, res, next) {
    var email = req.query.email;
    var page = req.query.page == undefined ? 1 : req.query.page;
    var limit = req.query.limit == undefined ? 20 : req.query.limit;

    userModel.getUserIdByEmail(email, res, function (result) {

      var userId = result.userId;

      var offset = (page - 1) * limit;
      var count = " LIMIT " + offset + "," + limit;

      connection.acquire(function (err, con) {
        if (err) throw err;
        var sql = 'SELECT * FROM users WHERE user_invited_by = "' + userId + '" AND status = 2 ORDER BY user_id DESC ' + count;
        con.query(sql, function (err, data) {
          con.release();
          if (err) return res.status(500).json({ statusCode: 500, message: err.code });

          var dt = [];

          for (var i = 0; i < data.length; i++) {
            var pp = data[i].user_photo ? cfg.photoProfileUrl + '' + data[i].user_photo : null;

            var fullName = data[i].user_firstname + ' ' + data[i].user_lastname;

            var splitName = fullName.trim().split(" ");

            if (splitName.length > 1) {
              var initialName = splitName[0].charAt(0) + '' + splitName[1].charAt(0);
            } else {
              var initialName = splitName[0].charAt(0);
            }

            initialName = initialName.toUpperCase();

            dt.push({
              "userId": data[i].user_id,
              "email": data[i].user_email,
              "firstName": data[i].user_firstname,
              "lastName": data[i].user_lastname,
              "initialName": initialName,
              "photoUrl": pp,
              "mobileNumber": data[i].user_mobile_number,
              "phoneNumber": data[i].user_phone_number,
              "line": data[i].user_line,
              "whatsapp": data[i].user_whatsapp,
              "facebook": data[i].user_facebook,
              "instagram": data[i].user_instagram,
              "wechat": data[i].user_wechat,
              "country": data[i].user_country,
              "address1": data[i].user_address1,
              "address2": data[i].user_address2,
              "language": data[i].user_language
            });
          }

          return res.status(200).json({ statusCode: 200, success: true, data: dt });
        });
      });
    });
  };

  this.active = function (req, res, next) {
    var email = req.query.email;
    var page = req.query.page == undefined ? 1 : req.query.page;
    var limit = req.query.limit == undefined ? 20 : req.query.limit;

    userModel.getUserIdByEmail(email, res, function (result) {

      var userId = result.userId;

      var offset = (page - 1) * limit;
      var count = " LIMIT " + offset + "," + limit;

      connection.acquire(function (err, con) {
        if (err) throw err;
        var sql = 'SELECT * FROM users WHERE user_invited_by = "' + userId + '" AND status = 1 ORDER BY user_id DESC ' + count;
        con.query(sql, function (err, data) {
          con.release();
          if (err) return res.status(500).json({ statusCode: 500, message: err.code });

          var dt = [];
          for (var i = 0; i < data.length; i++) {
            var pp = data[i].user_photo ? cfg.photoProfileUrl + '' + data[i].user_photo : null;
            var fullName = data[i].user_firstname + ' ' + data[i].user_lastname;

            var splitName = fullName.trim().split(" ");

            if (splitName.length > 1) {
              var initialName = splitName[0].charAt(0) + '' + splitName[1].charAt(0);
            } else {
              var initialName = splitName[0].charAt(0);
            }

            initialName = initialName.toUpperCase();

            dt.push({
              "userId": data[i].user_id,
              "email": data[i].user_email,
              "firstName": data[i].user_firstname,
              "lastName": data[i].user_lastname,
              "initialName": initialName,
              "photoUrl": pp,
              "mobileNumber": data[i].user_mobile_number,
              "phoneNumber": data[i].user_phone_number,
              "line": data[i].user_line,
              "whatsapp": data[i].user_whatsapp,
              "facebook": data[i].user_facebook,
              "instagram": data[i].user_instagram,
              "wechat": data[i].user_wechat,
              "country": data[i].user_country,
              "address1": data[i].user_address1,
              "address2": data[i].user_address2,
              "language": data[i].user_language
            });
          }

          return res.status(200).json({ statusCode: 200, success: true, data: dt });
        });
      });
    });
  };

  this.activated = function (req, res, next) {

    var email = req.body.email,
        invitedBy = req.body.invitedBy;

    userModel.getUserIdByEmail(invitedBy, res, function (result) {
      var userId = result.userId;

      connection.acquire(function (err, con) {
        if (err) throw err;

        var sql = "UPDATE users set status = 1 \
        ,update_date = NOW() WHERE user_email = '" + email + "' AND user_invited_by = '" + userId + "' ";

        con.query(sql, function (err, data) {

          if (err) return res.status(500).json({ statusCode: 500, message: err.code });

          if (data.affectedRows == 0) return res.status(500).json({ statusCode: 500, message: "either 'email' or 'invitedBy' wrong" });

          userModel.updatePoint(userId, 3, res, function (result) {
            return res.status(200).json({ statusCode: 200, success: true });
          });
        });
      });
    });
  };

  this.ranking = function (req, res, next) {
    var email = req.query.email;
    var page = req.query.page == undefined ? 1 : req.query.page;
    var limit = req.query.limit == undefined ? 20 : req.query.limit;

    userModel.getUserIdByEmail(email, res, function (result) {

      var userId = result.userId;

      var offset = (page - 1) * limit;
      var count = " LIMIT " + offset + "," + limit;

      connection.acquire(function (err, con) {
        if (err) throw err;
        var sql = 'SELECT * FROM users WHERE user_invited_by = "' + userId + '" AND status <> 0 ORDER BY user_point DESC ' + count;
        con.query(sql, function (err, data) {
          con.release();
          if (err) return res.status(500).json({ statusCode: 500, message: err.code });

          var dt = [];
          for (var i = 0; i < data.length; i++) {
            var pp = data[i].user_photo ? cfg.photoProfileUrl + '' + data[i].user_photo : null;
            dt.push({
              "userId": data[i].user_id,
              "email": data[i].user_email,
              "firstName": data[i].user_firstname,
              "lastName": data[i].user_lastname,
              "photoUrl": pp,
              "mobileNumber": data[i].user_mobile_number,
              "phoneNumber": data[i].user_phone_number,
              "line": data[i].user_line,
              "whatsapp": data[i].user_whatsapp,
              "facebook": data[i].user_facebook,
              "instagram": data[i].user_instagram,
              "wechat": data[i].user_wechat,
              "country": data[i].user_country,
              "address1": data[i].user_address1,
              "address2": data[i].user_address2,
              "language": data[i].user_language,
              "point": data[i].user_point
            });
          }

          return res.status(200).json({ statusCode: 200, success: true, data: dt });
        });
      });
    });
  };
}
module.exports = new cMember();
//# sourceMappingURL=member.js.map
