'use strict';

var bcrypt = require('bcrypt');
var connection = require('../../../config/db');

var methods = {
	
	comparePassword: function(password, hash_password) {
		return bcrypt.compareSync(password, hash_password);
	},
	getUserIdByEmail: function(con,email,res,callback){
        console.log(email);

        if(email == "root"){
            callback({"userId":"root"});    
        }else{
            con.query('SELECT user_id FROM users WHERE user_email = "'+email+'" LIMIT 1', function (err, data, fields){
                if(err)
                    return res.status(500).json({statusCode:500,message: err.code});

                if(callback){

                    if(data.length < 1){
                        return res.status(500).json({statusCode:500,message: "Either data user or data inviter not found"});
                    }else{
                        callback({"userId":data[0].user_id});
                    }
                }

            });
        }
	},
	getReferalCodeByEmail: function(con,email,res,callback){

		con.query('SELECT user_id, user_username FROM users WHERE user_email = "'+email+'" LIMIT 1', function (err, data, fields){
    		if(err)
        		return res.status(500).json({statusCode:500,message: err.code});

        	if(callback){

        		if(data.length < 1){
          			return res.status(500).json({statusCode:500,message: "Referal code not found"});
        		}else{
        			//var referalCode = email.split("@");
        			//referalCode = referalCode[0];
          			//callback({"referalCode":referalCode+''+data[0].user_id});
                    callback({"referalCode":data[0].user_username});
          		}
        	}

		});
	},
	checkEmailExist: function(con,email,res,callback){

		con.query('SELECT user_email FROM users WHERE user_email = "'+email+'" LIMIT 1', function (err, data, fields){
    		if(err)
        		return res.status(500).json({statusCode:500,message: err.code});

        	if(callback){
        		if(data.length > 0){
          			return res.status(500).json({statusCode:500,message: "Email has been registered"});
        		}else{
        			callback(true);
        		}

        	}
		});
     	
	},
    checkUsernameExist: function(con,username,res,callback){

        con.query('SELECT user_username FROM users WHERE user_username = "'+username+'" LIMIT 1', function (err, data, fields){
            if(err)
                return res.status(500).json({statusCode:500,message: err.code});

            if(callback){
                if(data.length > 0){
                    return res.status(500).json({statusCode:500,message: "Username has been registered"});
                }else{
                    callback(true);
                }

            }
        });
        
    },
    checkUsernameCompareExist: function(con,username,oldUsername,res,callback){

        if(username != oldUsername){
            con.query('SELECT user_username FROM users WHERE user_username = "'+username+'" LIMIT 1', function (err, data, fields){
                if(err)
                    return res.status(500).json({statusCode:500,message: err.code});

                if(callback){
                    if(data.length > 0){
                        return res.status(500).json({statusCode:500,message: "Username has been registered"});
                    }else{
                        callback(true);
                    }

                }
            });
        }else{
            callback(true);   
        }
        
    },
	checkUserReferalCode: function(con,email,referalCode,res,callback){

		var sql = "SELECT user_id, user_email, user_firstname, user_lastname, user_invited_by FROM users WHERE user_email = '"+email+"' AND user_referal_code = '"+referalCode+"' LIMIT 1";
	
		con.query(sql, function (err, data, fields){
    		if(err)
        		return res.status(500).json({statusCode:500,message: err.code});

            if(data.length < 1)
                return res.status(500).json({statusCode:500,message: "Inviter not found"});

        	var inviterId = data[0].user_invited_by;
        	var userName = data[0].user_firstname+' '+data[0].user_lastname;
        	var userEmail = data[0].user_email;
        	var userId = data[0].user_id;

        	var sql2 = "SELECT user_email, user_firstname, user_lastname FROM users WHERE user_id = '"+inviterId+"' LIMIT 1";

        	con.query(sql2, function (err, data, fields){
        		if(err)
        			return res.status(500).json({statusCode:500,message: err.code});

        		var inviterName = data[0].user_firstname+' '+data[0].user_lastname;
        		var inviterEmail = data[0].user_email

        		if(callback){
            		if(data.length < 1){
              			return res.status(500).json({statusCode:500,message: "Email or Referal Code not found"});
            		}else{
            			callback({
            				"inviterId":inviterId,
            				"userId":userId,
            				"userName":userName,
            				"userEmail":userEmail,
            				"inviterName":inviterName,
            				"inviterEmail":inviterEmail
            			});
            		}

            	}
        	});

        	
		});
	},
	updatePoint: function(con,userId,point,res,callback){

		var sql = "update users set user_point = user_point+"+point+", update_date = NOW() WHERE user_id = '"+userId+"'";
	
		con.query(sql, function (err, data){
    		if(err)
        		return res.status(500).json({statusCode:500,message: err.code});

        	if(callback){
        		callback(true);
        	}
		});
     	
	},
    updatePointByEmail: function(con,email,point,res,callback){

        var sql = "update users set user_point = user_point+"+point+", update_date = NOW() WHERE user_email = '"+email+"'";
    
        con.query(sql, function (err, data){
            if(err)
                return res.status(500).json({statusCode:500,message: err.code});

            if(callback){
                callback(true);
            }
        });
        
    },
	test: function(){
		return 'bcd';
	}
};

module.exports = methods;