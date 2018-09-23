'use strict';

var cfg = require('../../../config');
const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(cfg.apikey_sendgrid);

var email = {
	
	sendEmailRegister: function(to,toName,invitedBy) {

		var html = "<p>HANYA SELANGKAH LAGI…Anda akan menemukan RAHASIA bagaimana setiap orang termasuk Anda bisa menjadi KAYA & SUKSES lewat Mobile Business yang paling dicari-cari orang saat ini meski Anda Gaptek & Ga’ punya pengalaman sama sekali.</p> \
		<p>Segera KLIK Link Download Aplikasi Mobile di bawah ini:</p><p>https://play.google.com/store/apps/details?id=com.morich.app</p> \
		Setelah itu ketik Username di bawah ini: \
		"+invitedBy;
		
	    const msg = {
	    	to: to,
	        from: {email: 'hello@morichworldwide.com',name: 'MorichWorldWide'},
			subject: 'Download MORICH Apps Sekarang...!!! Rahasia menjadi “YOUNG & RICH”',
	        html: html,
	    };

	    sgMail.send(msg);
		
		return sgMail;
	},
	sendTmpPassword: function(to,password,status,username) {

		if(status == "1"){
			var acc = "member";
		}else{
			var acc = "prospek";
		}
		
	    const msg = {
	    	to: to,
	        from: {email: 'hello@morichworldwide.com',name: 'MorichWorldWide'},
			subject: 'Your Temporary Password!!',
	        html: '<p>Your account has been changed become to <b>'+acc+'</b>. Your username: <b>'+username+'</b> and this is your temporary password: <b>'+password+'</b>.',
	    };

	    sgMail.send(msg);
		
		return sgMail;
	},
	sendEmailSubmission: function(dt) {

		var html = '<p>Selamat...!!!</p> \
					<p>Inilah calon Lisensi JMobile Jeunesse Anda.</p><br><br> \
					<p>Segera follow up...!!!</p><br> \
					<p><b>Name:</b> '+dt.fullName+'</p> \
					<p><b>Email:</b> '+dt.email+'</p> \
					<p><b>Whatsapp:</b> '+dt.hpWa+'</p> \
					<p><b>Languages:</b> '+dt.languages+'</p> \
					<p><b>City:</b> '+dt.city+'</p> \
					<p><b>Age:</b> '+dt.age+'</p> \
					<p><b>Current Occupation:</b> '+dt.currentOccupation+'</p> \
					<p><b>Experience in Mobile Business:</b> '+dt.isExperienceInMobileBusiness+'</p> \
					<p><b>Target Mobile Business 180 Days:</b> '+dt.targetMobileBusiness180Days+'</p> \
					<p><b>Reason:</b> '+dt.reason+'</p> \
					<p><b>Urgency Level:</b> '+dt.urgencyLevel+'</p> \
					<p><b>Serious Level:</b> '+dt.seriousLevel+'</p> \
					<p><b>Capital Investments:</b> '+dt.capitalInvestment+'</p> \
					<p><b>Ready to Join:</b> '+dt.readyToJoin+'</p> \
					<p><b>Available Contact to Mobile:</b> '+dt.isAvailableContactToMobile+'</p>';
		
	    const msg = {
	    	to: dt.referralEmail,
	        from: {email: 'hello@morichworldwide.com',name: 'MorichWorldWide'},
			subject: 'Calon Partner Lisensi JMobile',
	        html: html ,
	    };

	    sgMail.send(msg);
		
		return sgMail;
		console.log(dt.referralEmail);
	},
	sendEmailRegisterBackup: function(to,code,password) {
		
	    const msg = {
	    	to: to,
	        //from: 'hello@pixrom.com',
	        from: {email: 'hello@morichworldwide.com',name: 'MorichWorldWide'},
			//subject: 'Complete Your Registration!!',
			subject: 'Your Registration has been success!!',
	        //text: 'and easy to do anywhere, even with Node.js',
	        html: '<p><strong>Thank you for registering in Morich.</strong></p><p>To login in app, please enter <b>'+to+'</b> as your username and <b>'+password+'</b> as your password.',
	    };

	    sgMail.send(msg);
		
		return sgMail;
	},
	sendEmailCompleteRegister: function(userName,userEmail,inviterName,inviterEmail) {

	    const msg = {
	    	to: userEmail,
	        from: {email: 'hello@morichworldwide.com',name: 'MorichWorldWide'},
	        subject: 'Congrats for your registration',
	        html: '<p><strong>Hai '+userName+', Your registration has been completed.</strong></p><p>Your Leader: <b>'+inviterName+'</b> ('+inviterEmail+'). ',
	    };

	    sgMail.send(msg);
		
		return sgMail;
	},
	sendEmailForgotPassword: function(email,token) {

	    const msg = {
	    	to: email,
	        from: {email: 'hello@morichworldwide.com',name: 'MorichWorldWide'},
	        subject: 'Reset your password!!!',
	        html: '<p>To reset your password, please click or copy paste this link https://morichworldwide/password-reset/'+token+' on your browser. ',
	    };

	    sgMail.send(msg);
		
		return sgMail;
	},
	sendEmailUserRegisterFromAdmin: function(email,fullName,password,username) {
		
	    const msg = {
	    	to: email,
	        from: {email: 'hello@morichworldwide.com',name: 'MorichWorldWide'},
	        subject: 'Hello '+fullName,
	        html: '<p><strong>Your account has been successfully registered.</strong></p><p>Your username: <b>'+username+'</b></p><p><b>Login Account:</b></p><p>Username: '+email+'</p><p>Temporary Password: '+password+'</p>',
	    };

	    sgMail.send(msg);
		
		return sgMail;
	},
	sendEmailContactUs: function(email,name,message) {
		
	    const msg = {
	    	to: 'hello@morichworldwide.com',
	        from: {email: email,name: 'MorichWorldWide | '+name},
	        subject: 'Message from '+name,
	        html: '<p>'+message+'</p>',
	    };

	    sgMail.send(msg);
		
		return sgMail;
	},

};

module.exports = email;