var connection = require('../../../config/db');

var jwt = require('jsonwebtoken'),
    bcrypt = require('bcrypt'),
    crypto = require('crypto'),
    userModel = require('../models/user'),
    emailModel = require('../models/email'),
    cfg = require('../../../config'),
    empty = require('is-empty');

function cAuth() {

  this.login = function (req, res, next) {
    if (empty(req.body.email) || empty(req.body.password)) return res.status(500).json({ statusCode: 500, message: "Please check your parameter or value required" });

    connection.acquire(function (err, con) {
      if (err) throw err;

      var email = req.body.email;
      var password = req.body.password;

      var sql = "SELECT *, user_id as id, user_invited_by as invited_id, (select count(user_id) from users WHERE user_invited_by = id) as total_invited, (select user_email FROM users WHERE user_id = invited_id) as inviter_email, \
            (select count(user_id) from users WHERE user_invited_by = id AND status = '1') as member_joined, (select count(user_id) from users WHERE user_invited_by = id AND status = '2') as member_prospect, FIND_IN_SET( user_point, (SELECT GROUP_CONCAT( user_point ORDER BY user_point DESC ) FROM users )) \
        AS rank FROM users WHERE user_email = '" + email + "' LIMIT 1";

      con.query(sql, function (err, data) {
        con.release();
        if (err) return res.status(500).json({ statusCode: 500, message: err.code });

        if (data.length < 1) return res.status(500).json({ statusCode: 500, message: 'Authentication failed. Invalid user or password.' });

        if (empty(data[0].user_password)) return res.status(500).json({ statusCode: 500, message: 'Authentication failed. Invalid user or password.' });

        if (!userModel.comparePassword(password, data[0].user_password)) {
          return res.status(500).json({ statusCode: 500, message: 'Authentication failed. Invalid user or password.' });
        }

        var pp = data[0].user_photo ? cfg.photoProfileUrl + '' + data[0].user_photo : null;
        var fullName = data[0].user_firstname + ' ' + data[0].user_lastname;

        var splitName = fullName.trim().split(" ");

        if (splitName.length > 1) {
          var initialName = splitName[0].charAt(0) + '' + splitName[1].charAt(0);
        } else {
          var initialName = splitName[0].charAt(0);
        }

        initialName = initialName.toUpperCase();

        var statusAccount = "";

        if (data[0].status == 0) {
          statusAccount = "in";
        }

        if (data[0].status == 1) {
          statusAccount = "member";
        }

        if (data[0].status == 2) {
          statusAccount = "prospek";
        }

        return res.status(200).json({
          statusCode: 200,
          success: true,
          data: {
            "userId": data[0].user_id,
            "email": data[0].user_email,
            "username": data[0].user_username,
            "firstName": data[0].user_firstname,
            "lastName": data[0].user_lastname,
            "mobileNumber": data[0].user_mobile_number,
            "photoUrl": pp,
            "language": data[0].user_language,
            "initialName": initialName,
            "ranking": data[0].rank,
            "url": "https://morichworldwide.com/" + data[0].user_username,
            "totalInvited": data[0].total_invited,
            "memberJoined": data[0].member_joined,
            "memberProspect": data[0].member_prospect,
            "accountStatus": statusAccount,
            "emailInviter": data[0].inviter_email
          }
        });
      });
    });
  };

  this.forgotPassword = function (req, res, next) {
    if (empty(req.body.email)) return res.status(500).json({ statusCode: 500, message: "Please check your parameter or value required" });
    connection.acquire(function (err, con) {
      if (err) throw err;

      var email = req.body.email;
      var secret = "ngopingapangopi" + Date.now();

      const token = crypto.createHmac('sha256', secret).update(email).digest('hex');

      var sql = "SELECT * FROM users WHERE user_email = '" + email + "' LIMIT 1";

      con.query(sql, function (err, data) {
        con.release();
        if (err) return res.status(500).json({ statusCode: 500, message: err.code });

        if (data.length < 1) return res.status(500).json({ statusCode: 500, message: 'Invalid Email. Email has not registered.' });

        con.query("UPDATE users set user_token = '" + token + "', update_date = NOW() WHERE user_email = '" + email + "'", function (err, data) {
          if (err) return res.status(500).json({ statusCode: 500, message: err.code });

          emailModel.sendEmailForgotPassword(email, token);
          return res.status(200).json({ statusCode: 200, success: true });
        });
      });
    });
  };

  this.passwordReset = function (req, res, next) {
    connection.acquire(function (err, con) {
      if (err) throw err;

      var token = req.params.token;

      //console.log(token);

      var sql = "SELECT * FROM users WHERE user_token = '" + token + "' LIMIT 1";

      con.query(sql, function (err, data) {
        con.release();
        if (err) return res.status(500).json({ statusCode: 500, message: err.code });

        if (data.length < 1) return res.status(500).json({ statusCode: 500, message: 'Link token may have expired.' });

        return res.status(200).json({ statusCode: 200, success: true, data: { "token": token } });
      });
    });
  };

  this.passwordResetPost = function (req, res, next) {
    if (empty(req.body.token) || empty(req.body.password) || empty(req.body.retypePassword)) return res.status(500).json({ statusCode: 500, message: "Please check your parameter or value required" });
    connection.acquire(function (err, con) {
      if (err) throw err;

      var token = req.body.token;
      var password = bcrypt.hashSync(req.body.password, 10);
      var retypePassword = req.body.retypePassword;

      if (req.body.password != req.body.retypePassword) return res.status(500).json({ statusCode: 500, message: "Password doesn't match" });

      var sql = "UPDATE users SET user_password = '" + password + "', update_date = NOW() WHERE user_token = '" + token + "'";

      //console.log(sql);

      con.query(sql, function (err, data) {
        con.release();
        if (err) return res.status(500).json({ statusCode: 500, message: err.code });

        return res.status(200).json({ statusCode: 200, success: true });
      });
    });
  };

  this.loginRequired = function (req, res, next) {
    if (req.user) {
      next();
    } else {
      return res.status(401).json({ statusCode: 401, message: 'Unauthorized user!' });
    }
  };
}
module.exports = new cAuth();
//# sourceMappingURL=auth.js.map
