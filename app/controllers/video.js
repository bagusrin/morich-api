var connection = require('../../config/db');

var jwt = require('jsonwebtoken'),
    bcrypt = require('bcrypt'),
    userModel = require('../models/user');
 
function cVideo() {
 
  this.list = function(req,res,next) {

    var email = req.query.email;
    var page = (req.query.page == undefined) ? 1 : req.query.page;
    var limit = (req.query.limit == undefined) ? 20 : req.query.limit;
    
    userModel.getUserIdByEmail(email,res,function(result){
      
      var userId = result.userId;
      var offset = (page - 1) * limit;
      var count = " LIMIT "+offset+","+limit;

      connection.acquire(function(err,con){
        if (err) throw err;

          var sql = "SELECT v.*, u.user_firstname, u.user_lastname from videos v LEFT JOIN \
          users u ON v.user_id = u.user_id WHERE v.status = 1 AND u.user_id = '"+userId+"' ORDER BY video_id DESC "+count
          
          con.query(sql, function(err,data){
            con.release();
            if(err)
                return res.status(500).json({statusCode:500,message: err.code});
               

            var dt = [];
            for (var i = 0; i < data.length; i++) {
                dt.push({
                  "videoId": data[i].video_id,
                  "youtubeId": data[i].video_youtube_id,
                  "youtubeLink": data[i].video_youtube_link,
                  "youtubeIframe": data[i].video_youtube_iframe,
                  "youtubeImg": data[i].video_youtube_image,
                  "title": data[i].video_title,
                  "description": data[i].video_desc,
                  "author": data[i].user_firstname+' '+data[i].user_lastname,
                  "postDate": data[i].post_date
                });
            }

            return res.status(200).json({
                                    statusCode:200,
                                    success:true,
                                    data:dt
                                });
   
        });
      });

    });
  }

  this.detail = function(req,res,next) {

      var videoId = req.params.id;
    
      connection.acquire(function(err,con){
        if (err) throw err;

          var sql = "SELECT v.*, u.user_firstname, u.user_lastname from videos v LEFT JOIN \
          users u ON v.user_id = u.user_id WHERE v.status = 1 AND v.video_id = '"+videoId+"' LIMIT 1";
          
          con.query(sql, function(err,data){
            con.release();
            if(err)
                return res.status(500).json({statusCode:500,message: err.code});

            if(data.length < 1){
              res.status(404).json({statusCode:404,message: "Data not found"});
            }else{
              var dt = [];
              dt.push({
                "videoId": data[0].video_id,
                "youtubeId": data[0].video_youtube_id,
                "youtubeLink": data[0].video_youtube_link,
                "youtubeIframe": data[0].video_youtube_iframe,
                "youtubeImg": data[0].video_youtube_image,
                "title": data[0].video_title,
                "description": data[0].video_desc,
                "author": data[0].user_firstname+' '+data[0].user_lastname,
                "postDate": data[0].post_date
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

  this.post = function(req,res,next) {
    var youtubeLink = req.body.youtubeLink;
    var title = req.body.title;
    var desc = req.body.desc;
    var youtubeId = youtubeLink.split("v=")[1];
    var youtubeIframe = "https://youtube.com/embed/"+youtubeId;
    var youtubeImg = "https://i.ytimg.com/vi/"+youtubeId+"/maxresdefault.jpg";
    var status = 1;
    var email = req.body.email;

    userModel.getUserIdByEmail(email,res,function(result){
      
      var userId = result.userId;

      connection.acquire(function(err,con){
        if (err) throw err;

          var sql = "INSERT INTO videos (user_id, video_youtube_id, video_youtube_link, video_youtube_iframe \
          ,video_youtube_image,video_title,video_desc,status,post_date) \
          VALUES ('"+userId+"','"+youtubeId+"','"+youtubeLink+"','"+youtubeIframe+"','"+youtubeImg+"','"+title+"', '"+desc+"', '"+status+"', NOW())";

          console.log(sql);

          con.query(sql, function(err,data){
            con.release();
            if(err)
                return res.status(500).json({statusCode:500,message: err.code});
               

            return res.status(200).json({
                                    statusCode:200,
                                    success:true,
                                    data:{"videoId":data.insertId}
                                });
   
        });
      });
    });
     
  };

  this.update = function(req,res,next) {
    var videoId = req.body.videoId;
    var youtubeLink = req.body.youtubeLink;
    var title = req.body.title;
    var desc = req.body.desc;
    var youtubeId = youtubeLink.split("v=")[1];
    var youtubeIframe = "https://youtube.com/embed/"+youtubeId;
    var youtubeImg = "https://i.ytimg.com/vi/"+youtubeId+"/maxresdefault.jpg";
    var status = 1;
    var email = req.body.email;

    userModel.getUserIdByEmail(email,res,function(result){
      
      var userId = result.userId;

      connection.acquire(function(err,con){
        if (err) throw err;

        var sql = "UPDATE videos SET video_youtube_id = '"+youtubeId+"' \
        ,video_youtube_link = '"+youtubeLink+"', video_youtube_link = '"+youtubeLink+"' \
        ,video_youtube_iframe = '"+youtubeIframe+"',video_youtube_image = '"+youtubeImg+"', video_title = '"+title+"', video_desc = '"+desc+"' \
        ,update_date = NOW() WHERE video_id = '"+videoId+"' AND user_id = '"+userId+"'";

          

        con.query(sql, function(err,data){
          con.release();
          if(err)
              return res.status(500).json({statusCode:500,message: err.code});
             

          return res.status(200).json({
                                  statusCode:200,
                                  success:true,
                                  data:{"videoId":videoId}
                              });
   
        });
      });
    });
  };

  this.delete = function(req,res,next) {
    var videoId = req.body.videoId;
    var email = req.body.email;

    userModel.getUserIdByEmail(email,res,function(result){
      
      var userId = result.userId;

      connection.acquire(function(err,con){
        if (err) throw err;

        var sql = "UPDATE videos SET status = 0 \
        ,update_date = NOW() WHERE video_id = '"+videoId+"' AND user_id = '"+userId+"'";

        //console.log(sql);

          

        con.query(sql, function(err,data){
          con.release();
          if(err)
              return res.status(500).json({statusCode:500,message: err.code});

          if(data.affectedRows == 0)
            return res.status(500).json({statusCode:500,message: "Failed to delete data. Check your parameter."}); 

          return res.status(200).json({
                                  statusCode:200,
                                  success:true
                              });
   
        });
      });
    });
  };

}
module.exports = new cVideo();