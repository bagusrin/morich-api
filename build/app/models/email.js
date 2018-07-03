'use strict';

var cfg = require('../../../config');
const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(cfg.apikey_sendgrid);

var email = {

	sendEmailRegister: function (to, code) {

		const msg = {
			to: to,
			//from: 'hello@pixrom.com',
			from: { email: 'hello@morichworldwide.com', name: 'MorichWorldWide' },
			subject: 'Complete Your Registration!!',
			//text: 'and easy to do anywhere, even with Node.js',
			html: '<p><strong>Thank you for registering in Morich.</strong></p><p>To complete your registration, please enter this code <b>' + code + '</b> in the field on Morich Mobile App (Android/IOS). '
		};

		sgMail.send(msg);

		return sgMail;
	},
	sendEmailCompleteRegister: function (userName, userEmail, inviterName, inviterEmail) {

		const msg = {
			to: userEmail,
			from: { email: 'hello@morichworldwide.com', name: 'MorichWorldWide' },
			subject: 'Congrats for your registration',
			html: '<p><strong>Hai ' + userName + ', Your registration has been completed.</strong></p><p>Your Leader: <b>' + inviterName + '</b> (' + inviterEmail + '). '
		};

		sgMail.send(msg);

		return sgMail;
	},
	sendEmailForgotPassword: function (email, token) {

		const msg = {
			to: email,
			from: { email: 'hello@morichworldwide.com', name: 'MorichWorldWide' },
			subject: 'Reset your password!!!',
			html: '<p>To reset your password, please click or copy paste this link https://morich.web/password-reset/' + token + ' on your browser. '
		};

		sgMail.send(msg);

		return sgMail;
	},
	sendEmailUserRegisterFromAdmin: function (email, fullName, password) {

		const msg = {
			to: email,
			from: { email: 'hello@morichworldwide.com', name: 'MorichWorldWide' },
			subject: 'Hello ' + fullName,
			html: '<p><strong>Your account has been successfully registered.</strong></p><p><b>Login Account:</b></p><p>Username: ' + email + '</p><p>Temporary Password: ' + password + '</p>'
		};

		sgMail.send(msg);

		return sgMail;
	},
	sendEmailContactUs: function (email, name, message) {

		const msg = {
			to: 'hello@morichworldwide.com',
			from: { email: email, name: 'MorichWorldWide | ' + name },
			subject: 'Message from ' + name,
			html: '<p>' + message + '</p>'
		};

		sgMail.send(msg);

		return sgMail;
	}

};

module.exports = email;
//# sourceMappingURL=email.js.map
