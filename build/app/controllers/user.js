var connection = require('../../../config/db');

var jwt = require('jsonwebtoken'),
    bcrypt = require('bcrypt'),
    userModel = require('../models/user'),
    generalModel = require('../models/general'),
    emailModel = require('../models/email'),
    cfg = require('../../../config'),
    empty = require('is-empty');

const axios = require('axios');
var multer = require('multer');

var storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, '../public/uploads/users');
  },
  filename: (req, file, cb) => {

    switch (file.mimetype) {
      case 'image/jpeg':
        var ext = '.jpeg';
        break;
      case 'image/jpg':
        var ext = '.jpg';
        break;
      case 'image/png':
        var ext = '.png';
        break;
    }

    cb(null, Date.now() + '' + ext);
  }
});

var upload = multer({ storage: storage });

function cUser() {

  this.userRegister = function (req, res, next) {

    if (empty(req.body.inviterEmail) || empty(req.body.email) || empty(req.body.firstName) || empty(req.body.phoneNumber)) return res.status(500).json({ statusCode: 500, message: "Please check your parameter or value required" });

    var inviterUsername = req.body.inviterUsername,
        inviterEmail = req.body.inviterEmail,
        email = req.body.email,
        firstName = req.body.firstName,
        lastName = req.body.lastName,
        phone = req.body.phoneNumber,
        status = 2;

    connection.acquire(function (err, con) {
      if (err) throw err;

      userModel.checkEmailExist(con, email, res, function (result) {

        userModel.getUserIdByEmail(con, inviterEmail, res, function (result) {

          var userId = result.userId;

          userModel.getReferalCodeByEmail(con, inviterEmail, res, function (result) {

            var referalCode = result.referalCode;

            var sql = "INSERT INTO users (user_email,user_firstname,user_lastname,user_mobile_number,user_invited_by,user_referal_code,status,post_date) \
                      VALUES ('" + email + "', '" + firstName + "','" + lastName + "', '" + phone + "', '" + userId + "', '" + referalCode + "', '" + status + "', NOW())";

            con.query(sql, function (err, data) {

              if (err) return res.status(500).json({ statusCode: 500, message: err.code });

              var sql2 = "INSERT INTO conversations (UserID_One, UserID_Two, UserOneStatus, UserTwoStatus, \
                        TransactTime) \
                        VALUES ('" + email + "','" + inviterEmail + "','2','2', NOW())";

              con.query(sql2, function (err2, data2) {
                if (err2) return res.status(500).json({ statusCode: 500, message: err2.code });

                userModel.updatePointByEmail(con, inviterEmail, 1, res, function (result) {
                  emailModel.sendEmailRegister(email, firstName, inviterUsername);
                  return res.status(200).json({ statusCode: 200, success: true, data: { "userId": data.insertId } });
                });
              });
            });
          });
        });
      });

      con.release();
    });
  };

  this.userDetail = function (req, res, next) {
    connection.acquire(function (err, con) {
      if (err) throw err;

      var sql = 'SELECT *, user_id as id, user_invited_by as invited_id, (select count(user_id) from users WHERE user_invited_by = id) as total_invited, (select user_email FROM users WHERE user_id = invited_id) as inviter_email, \
            (select count(user_id) from users WHERE user_invited_by = id AND status = "1") as member_joined, (select count(user_id) from users WHERE user_invited_by = id AND status = "2") as member_prospect, FIND_IN_SET( user_point, (SELECT GROUP_CONCAT( user_point ORDER BY user_point DESC ) FROM users )) \
            AS rank FROM users WHERE user_id=' + req.params.id + ' LIMIT 1';

      //console.log(sql);
      con.query(sql, function (err, data) {
        con.release();
        if (err) return res.status(500).json({ statusCode: 500, message: err.code });

        if (data.length < 1) {
          res.status(404).json({ statusCode: 404, message: "Data not found" });
        } else {

          var dt = [];
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
            statusAccount = "inactive";
          }

          if (data[0].status == 1) {
            statusAccount = "member";
          }

          if (data[0].status == 2) {
            statusAccount = "prospek";
          }

          dt.push({
            "userId": data[0].user_id,
            "email": data[0].user_email,
            "username": data[0].user_username,
            "firstName": data[0].user_firstname,
            "lastName": data[0].user_lastname,
            "initialName": initialName,
            "photoUrl": pp,
            "mobileNumber": data[0].user_mobile_number,
            "phoneNumber": data[0].user_phone_number,
            "line": data[0].user_line,
            "whatsapp": data[0].user_whatsapp,
            "facebook": data[0].user_facebook,
            "instagram": data[0].user_instagram,
            "wechat": data[0].user_wechat,
            "country": data[0].user_country,
            "address1": data[0].user_address1,
            "address2": data[0].user_address2,
            "language": data[0].user_language,
            "ranking": data[0].rank,
            "url": "https://morichworldwide.com/" + data[0].user_username,
            "totalInvited": data[0].total_invited,
            "memberJoined": data[0].member_joined,
            "memberProspect": data[0].member_prospect,
            "emailInviter": empty(data[0].inviter_email) ? 'root' : data[0].inviter_email,
            "accountStatus": statusAccount
          });

          return res.status(200).json({ statusCode: 200, success: true, data: dt[0] });
        }
      });
    });
  };

  this.userDetailByUsername = function (req, res, next) {
    connection.acquire(function (err, con) {
      if (err) throw err;

      var sql = 'SELECT *, user_id as id, user_invited_by as invited_id, (select count(user_id) from users WHERE user_invited_by = id) as total_invited, (select user_email FROM users WHERE user_id = invited_id) as inviter_email, \
            (select count(user_id) from users WHERE user_invited_by = id AND status = "1") as member_joined, (select count(user_id) from users WHERE user_invited_by = id AND status = "2") as member_prospect, FIND_IN_SET( user_point, (SELECT GROUP_CONCAT( user_point ORDER BY user_point DESC ) FROM users )) \
            AS rank FROM users WHERE user_username="' + req.params.username + '" LIMIT 1';

      //console.log(sql);
      con.query(sql, function (err, data) {
        con.release();
        if (err) return res.status(500).json({ statusCode: 500, message: err.code });

        if (data.length < 1) {
          res.status(404).json({ statusCode: 404, message: "Data not found" });
        } else {

          var dt = [];
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
            statusAccount = "inactive";
          }

          if (data[0].status == 1) {
            statusAccount = "member";
          }

          if (data[0].status == 2) {
            statusAccount = "prospek";
          }

          dt.push({
            "userId": data[0].user_id,
            "email": data[0].user_email,
            "username": data[0].user_username,
            "firstName": data[0].user_firstname,
            "lastName": data[0].user_lastname,
            "initialName": initialName,
            "photoUrl": pp,
            "mobileNumber": data[0].user_mobile_number,
            "phoneNumber": data[0].user_phone_number,
            "line": data[0].user_line,
            "whatsapp": data[0].user_whatsapp,
            "facebook": data[0].user_facebook,
            "instagram": data[0].user_instagram,
            "wechat": data[0].user_wechat,
            "country": data[0].user_country,
            "address1": data[0].user_address1,
            "address2": data[0].user_address2,
            "language": data[0].user_language,
            "ranking": data[0].rank,
            "url": "https://morichworldwide.com/" + data[0].user_username,
            "totalInvited": data[0].total_invited,
            "memberJoined": data[0].member_joined,
            "memberProspect": data[0].member_prospect,
            "emailInviter": empty(data[0].inviter_email) ? 'root' : data[0].inviter_email,
            "accountStatus": statusAccount
          });

          return res.status(200).json({ statusCode: 200, success: true, data: dt[0] });
        }
      });
    });
  };

  this.userGetIdByEmail = function (req, res, next) {
    var email = req.query.email;

    connection.acquire(function (err, con) {
      if (err) throw err;

      userModel.getUserIdByEmail(con, email, res, function (result) {

        var userId = result.userId;
        return res.status(200).json({ statusCode: 200, success: true, data: { "userId": userId } });
      });
      con.release();
    });
  };

  this.userStatisticByEmail = function (req, res, next) {
    var email = req.query.email;

    if (empty(email)) return res.status(500).json({ statusCode: 500, message: "Parameter email is required" });

    connection.acquire(function (err, con) {
      if (err) throw err;
      con.query('SELECT user_id as id, (select count(user_id) from users WHERE user_invited_by = id) as total_invited, \
          (select count(user_id) from users WHERE user_invited_by = id AND status = 1) as member_joined, (select count(user_id) from users WHERE user_invited_by = id AND status = "2") as member_prospect, FIND_IN_SET( user_point, (SELECT GROUP_CONCAT( user_point ORDER BY user_point DESC ) FROM users )) \
          AS rank FROM users WHERE user_email="' + req.query.email + '" LIMIT 1', function (err, data) {
        con.release();
        if (err) return res.status(500).json({ statusCode: 500, message: err.code });

        if (data.length < 1) {
          res.status(404).json({ statusCode: 404, message: "Data not found" });
        } else {

          var dt = [];

          dt.push({
            "ranking": data[0].rank,
            "totalInvited": data[0].total_invited,
            "memberJoined": data[0].member_joined,
            "memberProspect": data[0].member_prospect
          });

          return res.status(200).json({ statusCode: 200, success: true, data: dt[0] });
        }
      });
    });
  };

  this.userUpdate = function (req, res, next) {

    if (empty(req.body.firstName) && empty(req.body.email) && empty(req.body.mobileNumber) && empty(req.body.address1)) return res.status(500).json({ statusCode: 500, message: "Please check your parameter or value required" });

    var firstName = req.body.firstName,
        lastName = req.body.lastName,
        language = req.body.language,
        email = req.body.email,
        mobileNumber = req.body.mobileNumber,
        phoneNumber = req.body.phoneNumber,
        line = req.body.line,
        whatsapp = req.body.whatsapp,
        facebook = req.body.facebook,
        instagram = req.body.instagram,
        wechat = req.body.wechat,
        country = req.body.country,
        address1 = req.body.address1,
        address2 = req.body.address2;

    connection.acquire(function (err, con) {
      if (err) throw err;

      var sql = "UPDATE users set user_firstname = '" + firstName + "', user_lastname = '" + lastName + "' \
      ,user_language = '" + language + "' ,user_mobile_number = '" + mobileNumber + "' ,user_phone_number = '" + phoneNumber + "' \
      ,user_line = '" + line + "' \
      ,user_whatsapp = '" + whatsapp + "' \
      ,user_facebook = '" + facebook + "' \
      ,user_instagram = '" + instagram + "' \
      ,user_wechat = '" + wechat + "' \
      ,user_country = '" + country + "' \
      ,user_address1 = '" + address1 + "' \
      ,user_address2 = '" + address2 + "' \
      ,update_date = NOW() WHERE user_email = '" + email + "'";

      con.query(sql, function (err, data) {

        if (err) return res.status(500).json({ statusCode: 500, message: err.code });

        userModel.getUserIdByEmail(con, email, res, function (result) {
          var userId = result.userId;
          return res.status(200).json({ statusCode: 200, success: true, data: { "userId": userId } });
        });
      });

      con.release();
    });
  };

  this.userUploadPhoto = function (req, res, next) {

    if (empty(req.body.email)) return res.status(500).json({ statusCode: 500, message: "Please check your parameter or value required" });

    var photoProfile = req.file.filename;
    var email = req.body.email;

    connection.acquire(function (err, con) {
      if (err) throw err;

      userModel.getUserIdByEmail(con, email, res, function (result) {

        var userId = result.userId;

        var sql = "UPDATE users set user_photo = '" + photoProfile + "' \
        ,update_date = NOW() WHERE user_id= '" + userId + "'";

        con.query(sql, function (err, data) {

          if (err) return res.status(500).json({ statusCode: 500, message: err.code });

          return res.status(200).json({ statusCode: 200, success: true, data: { "userId": userId, "photoFilename": photoProfile } });
        });
      });

      con.release();
    });
  };

  this.uploadAction = upload.single('image');

  this.userSubmission = function (req, res, next) {

    var referralEmail = req.body.referralEmail,
        fullName = req.body.fullName,
        email = req.body.email,
        hpWa = req.body.hpWa,
        city = req.body.city,
        age = req.body.age,
        languages = req.body.languages,
        currentOccupation = req.body.currentOccupation,
        isExperienceInMobileBusiness = req.body.isExperienceInMobileBusiness,
        targetMobileBusiness180Days = req.body.targetMobileBusiness180Days,
        reason = req.body.reason,
        urgencyLevel = req.body.urgencyLevel,
        seriousLevel = req.body.seriousLevel,
        capitalInvestment = req.body.capitalInvestment,
        readyToJoin = req.body.readyToJoin,
        isAvailableContactToMobile = req.body.isAvailableContactToMobile;

    if (empty(referralEmail) || empty(fullName) || empty(email) || empty(hpWa) || empty(city) || empty(age) || empty(languages) || empty(currentOccupation) || empty(isExperienceInMobileBusiness) || empty(targetMobileBusiness180Days) || empty(reason) || empty(urgencyLevel) || empty(seriousLevel) || empty(capitalInvestment) || empty(readyToJoin) || empty(isAvailableContactToMobile)) {
      return res.status(500).json({ statusCode: 500, message: "Please check your parameter or value required" });
    }

    emailModel.sendEmailSubmission(req.body);
    return res.status(200).json({ statusCode: 200, success: true });
  };

  this.userList = function (req, res, next) {
    connection.acquire(function (err, con) {
      if (err) throw err;

      var sql = 'SELECT u.*, s.*, u.user_id as userID, u.post_date as postDate, s.post_date as submit_app_date, u.user_id as id, \
          u.user_invited_by as invited_id, \
          (select count(user_id) from users WHERE user_invited_by = id) as total_invited, \
          (select user_email FROM users WHERE user_id = invited_id) as inviter_email, \
          (select count(user_id) from users WHERE user_invited_by = id AND status = "1") as member_joined, (select count(user_id) from users WHERE user_invited_by = id AND status = "2") as member_prospect, \
          FIND_IN_SET( user_point, (SELECT GROUP_CONCAT( user_point ORDER BY user_point DESC ) FROM users )) \
          AS rank FROM users u LEFT JOIN application_submission s ON u.user_email = s.email WHERE u.user_email <> "hello@pixrom.com"';

      //console.log(sql);
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

          var statusAccount = "";

          if (data[i].status == 0) {
            statusAccount = "inactive";
          }

          if (data[i].status == 1) {
            statusAccount = "member";
          }

          if (data[i].status == 2) {
            statusAccount = "prospek";
          }

          var app = [];
          if (!empty(data[i].user_id)) {
            app = {
              "city": data[i].city,
              "age": data[i].age,
              "occupation": data[i].current_occupation,
              "isExperienceInMobileBusiness": data[i].is_experience_mobile_business,
              "targetMobileBusiness180Days": data[i].target_mobile_business_180_days,
              "reason": data[i].reason,
              "urgencyLevel": data[i].urgency_level,
              "seriousLevel": data[i].serious_level,
              "capitalInvestment": data[i].capital_investment,
              "readyToJoin": data[i].ready_to_join,
              "isAvailableContactToMobile": data[i].is_available_contact_to_mobile,
              "submitAppDate": data[i].submit_app_date
            };
          }

          dt.push({
            "userId": data[i].userID,
            "password": empty(data[i].user_password) ? "false" : "true",
            "email": data[i].user_email,
            "username": data[i].user_username,
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
            "language": data[i].user_language,
            "ranking": data[i].rank,
            "url": "https://morichworldwide.com/" + data[i].user_username,
            "totalInvited": data[i].total_invited,
            "memberJoined": data[i].member_joined,
            "memberProspect": data[i].member_prospect,
            "emailInviter": data[i].inviter_email,
            "accountStatus": statusAccount,
            "inviterId": data[i].user_invited_by,
            "postDate": data[i].postDate,
            "city": data[i].city,
            "age": data[i].age,
            "occupation": data[i].current_occupation,
            "isExperienceInMobileBusiness": data[i].is_experience_mobile_business,
            "targetMobileBusiness180Days": data[i].target_mobile_business_180_days,
            "reason": data[i].reason,
            "urgencyLevel": data[i].urgency_level,
            "seriousLevel": data[i].serious_level,
            "capitalInvestment": data[i].capital_investment,
            "readyToJoin": data[i].ready_to_join,
            "isAvailableContactToMobile": data[i].is_available_contact_to_mobile,
            "submitAppDate": data[i].submit_app_date
          });
        }
        return res.status(200).json({ statusCode: 200, success: true, data: dt });
      });
    });
  };

  this.activated = function (req, res, next) {

    var id = req.body.userId;
    var email = req.body.email;
    var username = req.body.username;
    var inviterId = req.body.inviterId;
    var isPassword = req.body.isPassword;
    var status = req.body.status;

    var point = "";

    if (req.body.status == "1") {
      point = 3;
    } else {
      point = 2;
    }

    var sqlNew = "UPDATE users set status = '" + req.body.status + "', user_username = '" + username + "' \
      , update_date = NOW() WHERE user_id = '" + id + "' ";
    var oriPassword = generalModel.getRandomStr();

    if (isPassword == "false") {
      var password = bcrypt.hashSync(oriPassword, 10);
      var sqlNew = "UPDATE users set status = '" + req.body.status + "', user_username = '" + username + "' \
      ,user_password = '" + password + "', update_date = NOW() WHERE user_id = '" + id + "' ";
    }

    connection.acquire(function (err, con) {
      if (err) throw err;

      userModel.checkUsernameExist(con, username, res, function (result) {

        var sql = sqlNew;

        //console.log(sql);

        con.query(sql, function (err, data) {
          if (err) return res.status(500).json({ statusCode: 500, message: err.code });

          if (data.affectedRows == 0) return res.status(500).json({ statusCode: 500, message: "either 'email' or 'invitedBy' wrong" });

          userModel.updatePoint(con, inviterId, point, res, function (result) {

            if (isPassword == "false") {
              emailModel.sendTmpPassword(email, oriPassword, status, username);
            }

            return res.status(200).json({ statusCode: 200, success: true });
          });
        });
      });
      con.release();
    });
  };

  this.userAdminPost = function (req, res, next) {

    //console.log(req.body);

    if (empty(req.body.firstName) || empty(req.body.mobileNumber) || empty(req.body.email)) return res.status(500).json({ statusCode: 500, message: "Please check your parameter or value required" });

    var email = req.body.email,
        username = req.body.username,
        firstName = req.body.firstName,
        lastName = req.body.lastName,
        mobileNumber = req.body.mobileNumber,
        referralEmail = req.body.referralEmail,
        statusAccount = req.body.status,
        password = generalModel.getRandomStr(),
        passwordEncrypt = bcrypt.hashSync(password, 10);

    if (empty(referralEmail)) {
      referralEmail = "root";
    }

    var point = "";

    if (statusAccount == "1") {
      point = 2;
    } else {
      point = 3;
    }

    connection.acquire(function (err, con) {
      if (err) throw err;

      userModel.checkEmailExist(con, email, res, function (result) {

        userModel.checkUsernameExist(con, username, res, function (result) {

          userModel.getUserIdByEmail(con, referralEmail, res, function (result) {

            var userIdReferral = result.userId;
            //console.log(userIdReferral);

            var sql = "INSERT INTO users (user_email,user_password,user_firstname,user_lastname,user_mobile_number,user_invited_by,post_date) \
                          VALUES ('" + email + "', '" + passwordEncrypt + "', '" + firstName + "', '" + lastName + "', '" + mobileNumber + "','" + userIdReferral + "',NOW())";

            con.query(sql, function (err, data) {

              if (err) return res.status(500).json({ statusCode: 500, message: err.code });

              var fullName = firstName + ' ' + lastName;

              var userId = data.insertId;;

              var sql2 = "UPDATE users set user_username = '" + username + "', status = '" + statusAccount + "', update_date = NOW() WHERE user_email = '" + email + "'";

              con.query(sql2, function (err2, data2) {
                if (err2) return res.status(500).json({ statusCode: 500, message: err2.code });

                if (referralEmail != 'root') {
                  var sql2 = "INSERT INTO conversations (UserID_One, UserID_Two, UserOneStatus, UserTwoStatus, \
                            TransactTime) \
                            VALUES ('" + email + "','" + referralEmail + "','2','2', NOW())";

                  con.query(sql2, function (err2, data2) {
                    if (err2) return res.status(500).json({ statusCode: 500, message: err2.code });

                    userModel.updatePointByEmail(con, referralEmail, point, res, function (result) {
                      emailModel.sendEmailUserRegisterFromAdmin(email, fullName, password, username);
                      return res.status(200).json({ statusCode: 200, success: true, data: { "userId": userId } });
                    });
                  });
                } else {
                  emailModel.sendEmailUserRegisterFromAdmin(email, fullName, password, username);
                  return res.status(200).json({ statusCode: 200, success: true, data: { "userId": userId } });
                }
              });
            });
          });
        });
      });
      con.release();
    });
  };

  this.userAdminUpdate = function (req, res, next) {

    //console.log(req.body);

    if (empty(req.body.firstName) || empty(req.body.mobileNumber) || empty(req.body.email)) return res.status(500).json({ statusCode: 500, message: "Please check your parameter or value required" });

    var email = req.body.email,
        userId = req.body.userId,
        username = req.body.username,
        firstName = req.body.firstName,
        lastName = req.body.lastName,
        mobileNumber = req.body.mobileNumber,
        referralEmail = req.body.referralEmail,
        oldReferralEmail = req.body.oldReferralEmail,
        oldUsername = req.body.oldUsername;

    if (empty(referralEmail)) {
      referralEmail = "root";
    }

    connection.acquire(function (err, con) {
      if (err) throw err;

      userModel.checkUsernameCompareExist(con, username, oldUsername, res, function (result) {

        userModel.getUserIdByEmail(con, referralEmail, res, function (result) {

          var userIdReferral = result.userId;

          var fullName = firstName + ' ' + lastName;

          var sql = "UPDATE users set user_username = '" + username + "', user_firstname = '" + firstName + "', user_lastname = '" + lastName + "', \
          user_mobile_number = '" + mobileNumber + "', user_invited_by = '" + userIdReferral + "', update_date = NOW() WHERE user_id = '" + userId + "'";

          //console.log(sql);

          con.query(sql, function (err, data) {
            if (err) return res.status(500).json({ statusCode: 500, message: err.code });

            if (referralEmail != 'root') {

              if (referralEmail != oldReferralEmail) {
                var sql2 = "INSERT INTO conversations (UserID_One, UserID_Two, UserOneStatus, UserTwoStatus, \
                      TransactTime) \
                      VALUES ('" + email + "','" + referralEmail + "','2','2', NOW())";

                con.query(sql2, function (err2, data2) {
                  if (err2) return res.status(500).json({ statusCode: 500, message: err2.code });

                  return res.status(200).json({ statusCode: 200, success: true, data: { "userId": userId } });
                });
              } else {
                return res.status(200).json({ statusCode: 200, success: true, data: { "userId": userId } });
              }
            } else {
              return res.status(200).json({ statusCode: 200, success: true, data: { "userId": userId } });
            }
          });
        });
      });

      con.release();
    });
  };

  this.userChangePassword = function (req, res, next) {

    if (empty(req.body.email) || empty(req.body.password) || empty(req.body.retypePassword)) return res.status(500).json({ statusCode: 500, message: "Please check your parameter or value required" });

    var email = req.body.email,
        password = bcrypt.hashSync(req.body.password, 10),
        retypePassword = req.body.retypePassword;

    if (req.body.password != req.body.retypePassword) return res.status(500).json({ statusCode: 500, message: "Password doesn't match" });

    connection.acquire(function (err, con) {

      var sql = "UPDATE users set user_password = '" + password + "', update_date = NOW() WHERE user_email = '" + email + "'";

      con.query(sql, function (err, data) {
        con.release();
        if (err) return res.status(500).json({ statusCode: 500, message: err.code });

        return res.status(200).json({ statusCode: 200, success: true });
      });
    });
  };

  this.delete = function (req, res, next) {
    var userId = req.body.userId;

    connection.acquire(function (err, con) {
      if (err) throw err;

      var sql = "DELETE FROM users WHERE user_id = '" + userId + "'";

      con.query(sql, function (err, data) {
        con.release();
        if (err) return res.status(500).json({ statusCode: 500, message: err.code });

        if (data.affectedRows == 0) return res.status(500).json({ statusCode: 500, message: "Failed to delete data. Check your parameter." });

        return res.status(200).json({
          statusCode: 200,
          success: true
        });
      });
    });
  };
}

module.exports = new cUser();
//# sourceMappingURL=user.js.map
