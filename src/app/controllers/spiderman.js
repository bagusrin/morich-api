var connection = require('../../../config/db');

var jwt = require('jsonwebtoken'),
    bcrypt = require('bcrypt'),
    userModel = require('../models/user');
 
function cSpiderman() {
 
  this.spidermanList = function(req,res,next) {
     connection.acquire(function(err,con){
        if (err) throw err;
          con.query('SELECT * FROM spiderman', function(err,data){
            con.release();
            if(err)
                return res.status(500).json({statusCode:500,message: err.code});
               

            var dt = [];
            for (var i = 0; i < data.length; i++) {
                dt.push({
                  "id": data[i].spiderman_id,
                  "email": data[i].spiderman_email,
                  "name": data[i].spiderman_name,
                  "level": data[i].spiderman_level
                });
            } 

            return res.status(200).json({
                                    statusCode:200,
                                    success:true,
                                    data:dt
                                });
   
        });
     });
  };

  this.spidermanDetail = function(req,res,next) {
     connection.acquire(function(err,con){
        if (err) throw err;
          con.query('SELECT * FROM spiderman WHERE spiderman_id='+req.params.id+' LIMIT 1', function(err,data){
            con.release();
            if(err)
                return res.status(500).json({statusCode:500,message: err.code});

            if(data.length < 1){
              res.status(404).json({statusCode:404,message: "Data not found"});
            }else{
              var dt = [];
              dt.push({
                "id": data[0].spiderman_id,
                "email": data[0].spiderman_email,
                "name": data[0].spiderman_name,
                "level": data[0].spiderman_level
              });

              return res.status(200).json({
                                      statusCode:200,
                                      success:true,
                                      data:dt[0]
                                  });
            }
        });
     });
  };

  this.spidermanRegister = function(req,res,next) {
     connection.acquire(function(err,con){
        if (err) throw err;

          var email = req.body.email;
          var password = bcrypt.hashSync(req.body.password, 10);
          var name = req.body.name;
          var level = 99;
          var status = 1;

          var sql = "INSERT INTO spiderman (spiderman_email,spiderman_password,spiderman_name,spiderman_level,status) VALUES ('"+email+"', '"+password+"', '"+name+"', '"+level+"', '"+status+"')";

          con.query(sql, function(err,data){
            con.release();
            if(err)
                return res.status(500).json({statusCode:500,message: err.code});
               

            return res.status(200).json({
                                    statusCode:200,
                                    success:true,
                                    data:data
                                });
   
        });
     });
  };

  this.spidermanLogin = function(req,res,next) {
     connection.acquire(function(err,con){
        if (err) throw err;

          var email = req.body.email;
          var password = req.body.password;

          var sql = "SELECT * FROM spiderman WHERE spiderman_email = '"+email+"'";

          con.query(sql, function(err,data){
            con.release();
            if(err)
                return res.status(500).json({statusCode:500,message: err.code});

            if(data.length < 1)
              return res.status(500).json({statusCode:500, message: 'Authentication failed. Invalid admin or password.' });
               
            if (!userModel.comparePassword(password,data[0].spiderman_password)) {
                  return res.status(401).json({statusCode:500, message: 'Authentication failed. Invalid admin or password.' });
            }

            var dt = [];
            dt.push({
              "id": data[0].spiderman_id,
              "email": data[0].spiderman_email,
              "name": data[0].spiderman_name,
              "level": data[0].spiderman_level
            });
            
            return res.status(200).json({
                                    statusCode:200,
                                    success:true,
                                    data:dt[0]
                                });
   
        });
     });
  };

  this.spidermanDashboard = function(req,res,next) {
     connection.acquire(function(err,con){
        if (err) throw err;

          var email = req.body.email;
          var password = req.body.password;

          var sql = "SELECT (SELECT count(user_id) FROM users WHERE status <> 0) AS member_joined \
                    ,(SELECT count(user_id) FROM users WHERE status = 2) AS member_potential \
                    ,(SELECT count(user_id) FROM users WHERE status = 1) AS member_active \
                    ,(SELECT count(video_id) FROM videos_admin WHERE status = 1) AS video";

          con.query(sql, function(err,data){
            con.release();
            if(err)
                return res.status(500).json({statusCode:500,message: err.code});

            

            var dt = [];
            dt.push({
              "totalJoinedMember": data[0].member_joined,
              "totalPotentialMember": data[0].member_potential,
              "totalActiveMember": data[0].member_active,
              "totalVideo": data[0].video
            });
            
            return res.status(200).json({
                                    statusCode:200,
                                    success:true,
                                    data:dt[0]
                                });
   
        });
     });
  };
}
module.exports = new cSpiderman();