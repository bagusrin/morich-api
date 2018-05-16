var connection = require('../../../config/db');

var jwt = require('jsonwebtoken'),
    bcrypt = require('bcrypt'),
    userModel = require('../models/user'),
    emailModel = require('../models/email'),
    cfg = require('../../../config');

var multer = require('multer');

var storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, '../public/uploads/users')
    },
    filename: (req, file, cb) => {

      switch(file.mimetype){
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

      cb(null, Date.now()+''+ext);
    }
});

var upload = multer({storage: storage});
 
function cUser() {

  this.userRegister = function(req,res,next) {
     
    var invitedBy = req.body.invitedBy,
        email = req.body.email,
        name = req.body.fullName,
        phone = req.body.phoneNumber,
        status = 0;

    userModel.checkEmailExist(email,res,function(result){  

      userModel.getUserIdByEmail(invitedBy,res,function(result){

        var userId = result.userId;

        userModel.getReferalCodeByEmail(invitedBy,res,function(result){

          var referalCode = result.referalCode;

          connection.acquire(function(err,con){
            if (err) throw err;

            var sql = "INSERT INTO users (user_email,user_firstname,user_mobile_number,user_invited_by,user_referal_code,status,post_date) \
                      VALUES ('"+email+"', '"+name+"', '"+phone+"', '"+userId+"', '"+referalCode+"', '"+status+"', NOW())";
              
            con.query(sql, function(err,data){
                
                if(err)
                  return res.status(500).json({statusCode:500,message: err.code});
                
                emailModel.sendEmailRegister(email,referalCode)
                return res.status(200).json({statusCode:200,success:true,data:{"userId":data.insertId}});
            });
          });
        });      
      });
    });
  };

  this.userJoin = function(req,res,next) {
     
    var invitedBy = req.body.invitedBy,
        email = req.body.email,
        password = bcrypt.hashSync(req.body.password, 10),
        retypePassword = req.body.retypePassword;

    if(req.body.password != req.body.retypePassword)
      return res.status(500).json({statusCode:500,message: "Password doesn't match"});

    userModel.checkUserReferalCode(email,invitedBy,res,function(result){

      var userName = result.userName;
      var userEmail = result.userEmail;
      var userId = result.userId;
      var inviterName = result.inviterName;
      var inviterEmail = result.inviterEmail;
      var userIdInvitedBy = result.inviterId;  

      connection.acquire(function(err,con){
        if (err) throw err;

        var sql = "UPDATE users set user_password = '"+password+"', status = 2, update_date = NOW() WHERE user_email = '"+email+"'";
          
        con.query(sql, function(err,data){
            
            if(err)
              return res.status(500).json({statusCode:500,message: err.code});
            
            userModel.updatePoint(userIdInvitedBy,1,res,function(result){
              emailModel.sendEmailCompleteRegister(userName,userEmail,inviterName,inviterEmail);
              return res.status(200).json({statusCode:200,success:true,data:{"userId":userId}});
            });
        });
      });
    });
  };

  this.userDetail = function(req,res,next) {
     connection.acquire(function(err,con){
        if (err) throw err;
          con.query('SELECT *, FIND_IN_SET( user_point, (SELECT GROUP_CONCAT( user_point ORDER BY user_point DESC ) FROM users )) \
        AS rank FROM users WHERE user_id='+req.params.id+' LIMIT 1', function(err,data){
            con.release();
            if(err)
                return res.status(500).json({statusCode:500,message: err.code});

            if(data.length < 1){
              res.status(404).json({statusCode:404,message: "Data not found"});
            }else{
              
              var dt = [];
              var pp = (data[0].user_photo) ? cfg.photoProfileUrl+''+data[0].user_photo : null;

              var fullName = data[0].user_firstname+' '+data[0].user_lastname;

              var splitName = fullName.trim().split(" ");

              if(splitName.length > 1){
                var initialName = splitName[0].charAt(0)+''+splitName[1].charAt(0);
              }else{
                var initialName = splitName[0].charAt(0);
              }

              dt.push({
                "userId": data[0].user_id,
                "email": data[0].user_email,
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
                "ranking": data[0].rank
              });

              return res.status(200).json({statusCode:200,success:true,data:dt[0]});
            }
        });
     });
  };

  this.userGetIdByEmail = function(req,res,next) {
      var email = req.query.email;

      userModel.getUserIdByEmail(email,res,function(result){

        var userId = result.userId;
        return res.status(200).json({statusCode:200,success:true,data:{"userId":userId}});

      }); 
  };

  this.userUpdate = function(req,res,next) {
     
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

    connection.acquire(function(err,con){
      if (err) throw err;

      var sql = "UPDATE users set user_firstname = '"+firstName+"', user_lastname = '"+lastName+"' \
      ,user_language = '"+language+"' ,user_mobile_number = '"+mobileNumber+"' ,user_phone_number = '"+phoneNumber+"' \
      ,user_line = '"+line+"' \
      ,user_whatsapp = '"+whatsapp+"' \
      ,user_facebook = '"+facebook+"' \
      ,user_instagram = '"+instagram+"' \
      ,user_wechat = '"+wechat+"' \
      ,user_country = '"+country+"' \
      ,user_address1 = '"+address1+"' \
      ,user_address2 = '"+address2+"' \
      ,update_date = NOW() WHERE user_email = '"+email+"'";
        
      con.query(sql, function(err,data){
          
          if(err)
            return res.status(500).json({statusCode:500,message: err.code});
          
          userModel.getUserIdByEmail(email,res,function(result){
            var userId = result.userId;
            return res.status(200).json({statusCode:200,success:true,data:{"userId":userId}});
          });
      });
    });
    
  };

  this.userUploadPhoto = function(req,res,next) {
     
    var photoProfile = req.file.filename;
    var email = req.body.email;

    userModel.getUserIdByEmail(email,res,function(result){

        var userId = result.userId;

        var sql = "UPDATE users set user_photo = '"+photoProfile+"' \
        ,update_date = NOW() WHERE user_id= '"+userId+"'";

        connection.acquire(function(err,con){
          if (err) throw err;

          con.query(sql, function(err,data){
            
            if(err)
              return res.status(500).json({statusCode:500,message: err.code});
            
            return res.status(200).json({statusCode:200,success:true,data:{"userId":userId,"photoFilename":photoProfile}});
          });
        });
    });
  };

  this.uploadAction = upload.single('image');
}
module.exports = new cUser();