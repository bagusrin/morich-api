'use strict';

var bcrypt = require('bcrypt');
var connection = require('../../../config/db');

var methods = {

    comparePassword: function (password, hash_password) {
        return bcrypt.compareSync(password, hash_password);
    },
    getUserIdByEmail: function (email, res, callback) {

        connection.acquire(function (err, con) {

            if (err) throw err;

            con.query('SELECT user_id FROM users WHERE user_email = "' + email + '" LIMIT 1', function (err, data, fields) {
                con.release();
                if (err) return res.status(500).json({ statusCode: 500, message: err.code });

                if (callback) {

                    if (data.length < 1) {
                        return res.status(500).json({ statusCode: 500, message: "Either data user or data inviter not found" });
                    } else {
                        callback({ "userId": data[0].user_id });
                    }
                }
            });
        });
    },
    getReferalCodeByEmail: function (email, res, callback) {

        connection.acquire(function (err, con) {

            if (err) throw err;

            con.query('SELECT user_id FROM users WHERE user_email = "' + email + '" LIMIT 1', function (err, data, fields) {
                con.release();
                if (err) return res.status(500).json({ statusCode: 500, message: err.code });

                if (callback) {

                    if (data.length < 1) {
                        return res.status(500).json({ statusCode: 500, message: "Referal code not found" });
                    } else {
                        var referalCode = email.split("@");
                        referalCode = referalCode[0];
                        callback({ "referalCode": referalCode + '' + data[0].user_id });
                    }
                }
            });
        });
    },
    checkEmailExist: function (email, res, callback) {

        connection.acquire(function (err, con) {

            if (err) throw err;

            con.query('SELECT user_email FROM users WHERE user_email = "' + email + '" LIMIT 1', function (err, data, fields) {
                con.release();
                if (err) return res.status(500).json({ statusCode: 500, message: err.code });

                if (callback) {
                    if (data.length > 0) {
                        return res.status(500).json({ statusCode: 500, message: "Email has been registered" });
                    } else {
                        callback(true);
                    }
                }
            });
        });
    },
    checkUserReferalCode: function (email, referalCode, res, callback) {

        connection.acquire(function (err, con) {

            if (err) throw err;

            var sql = "SELECT user_id, user_email, user_firstname, user_invited_by FROM users WHERE user_email = '" + email + "' AND user_referal_code = '" + referalCode + "' LIMIT 1";

            con.query(sql, function (err, data, fields) {
                con.release();
                if (err) return res.status(500).json({ statusCode: 500, message: err.code });

                var inviterId = data[0].user_invited_by;
                var userName = data[0].user_firstname + '' + data[0].user_lastname;
                var userEmail = data[0].user_email;
                var userId = data[0].user_id;

                var sql2 = "SELECT user_email, user_firstname FROM users WHERE user_id = '" + inviterId + "' LIMIT 1";

                con.query(sql2, function (err, data, fields) {
                    if (err) return res.status(500).json({ statusCode: 500, message: err.code });

                    var inviterName = data[0].user_firstname;
                    var inviterEmail = data[0].user_email;

                    if (callback) {
                        if (data.length < 1) {
                            return res.status(500).json({ statusCode: 500, message: "Email or Referal Code not found" });
                        } else {
                            callback({
                                "inviterId": inviterId,
                                "userId": userId,
                                "userName": userName,
                                "userEmail": userEmail,
                                "inviterName": inviterName,
                                "inviterEmail": inviterEmail
                            });
                        }
                    }
                });
            });
        });
    },
    updatePoint: function (userId, point, res, callback) {

        connection.acquire(function (err, con) {

            if (err) throw err;

            var sql = "update users set user_point = user_point+" + point + ", update_date = NOW() WHERE user_id = '" + userId + "'";

            con.query(sql, function (err, data) {
                con.release();
                if (err) return res.status(500).json({ statusCode: 500, message: err.code });

                if (callback) {
                    callback(true);
                }
            });
        });
    },
    getUserFullByEmail: function (email, res, callback) {

        connection.acquire(function (err, con) {

            if (err) throw err;

            var sql = "SELECT * FROM users WHERE user_email = '" + email + "' LIMIT 1";

            con.query(sql, function (err, data, fields) {
                con.release();
                if (err) return res.status(500).json({ statusCode: 500, message: err.code });

                if (callback) {
                    if (data.length < 1) {
                        return res.status(500).json({ statusCode: 500, message: "Data not found" });
                    } else {
                        callback(data);
                    }
                }
            });
        });
    },
    test: function () {
        return 'bcd';
    }
};

module.exports = methods;
//# sourceMappingURL=user.js.map
