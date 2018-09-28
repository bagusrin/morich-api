var connection = require('../../../config/db');

var jwt = require('jsonwebtoken'),
    bcrypt = require('bcrypt'),
    userModel = require('../models/user'),
    empty = require('is-empty');
 
function cVideoAdmin() {
 
  this.list = function(req,res,next) {

    var page = (req.query.page == undefined) ? 1 : req.query.page;
    var limit = (req.query.limit == undefined) ? 20 : req.query.limit;
    var type = req.query.type;
    var email = req.query.email;
    var show = req.query.show;
    
  
    var offset = (page - 1) * limit;
    var count = " LIMIT "+offset+","+limit;

    var search = "";

    if(!empty(type) && !empty(email)){
      search += " AND video_type = '"+type+"'";
      search += " AND (created_by = '"+email+"' OR created_by = 'admin') ";
      search += " AND status = 1";
    }

    if(!empty(type) && empty(email)){
      search += " AND video_type = '"+type+"'";
      search += " AND created_by = 'admin'";
      search += " AND status = 1";
    }

    if(empty(type) && !empty(email)){
      search += " AND created_by = '"+email+"'";
      search += " AND status = 1";
    }

    if(!empty(show)){

      if(show == "all"){
        search += " AND status <> 2";
        search += " AND video_position = 0";  
      }
      
    }

    if(empty(type) && empty(email) && empty(show)){
      search += " AND status = 1";
      search += " AND video_position = 0";
    } 

    connection.acquire(function(err,con){
      if (err) throw err;

        var sql = "SELECT * from videos_admin WHERE 1 "+search+" ORDER BY video_id DESC "+count

        console.log(sql);
        
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
                "contentMarketing": data[i].video_marketing,
                "type": data[i].video_type,
                "position": data[i].video_position,
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
  }

  this.listSlider = function(req,res,next) {

    var page = (req.query.page == undefined) ? 1 : req.query.page;
    var limit = (req.query.limit == undefined) ? 3 : req.query.limit;
    
  
    var offset = (page - 1) * limit;
    var count = " LIMIT "+offset+","+limit;

    connection.acquire(function(err,con){
      if (err) throw err;

        var sql = "SELECT * from videos_admin WHERE status = 1 AND video_position <> 0 ORDER BY video_position ASC "+count
        
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
                "contentMarketing": data[i].video_marketing,
                "type": data[i].video_type,
                "position": data[i].video_position,
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
  }

  this.listAdmin = function(req,res,next) {

    var page = (req.query.page == undefined) ? 1 : req.query.page;
    var limit = (req.query.limit == undefined) ? 20 : req.query.limit;
    var type = req.query.type;
    
  
    var offset = (page - 1) * limit;
    var count = " LIMIT "+offset+","+limit;

    var search = "";

    if(!empty(type)){
      search += " AND video_type = '"+type+"'";
    }

    connection.acquire(function(err,con){
      if (err) throw err;

        var sql = "SELECT * from videos_admin WHERE status <> 2 "+search+" ORDER BY video_id DESC "+count
        
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
                "contentMarketing": data[i].video_marketing,
                "type": data[i].video_type,
                "position": data[i].video_position,
                "createdBy": data[i].created_by,
                "status": data[i].status,
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
  }

  this.detail = function(req,res,next) {

      var videoId = req.params.id;
    
      connection.acquire(function(err,con){
        if (err) throw err;

          var sql = "SELECT * from videos_admin WHERE video_id = '"+videoId+"' LIMIT 1";
          
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
                "contentMarketing": data[0].video_marketing,
                "type": data[0].video_type,
                "position": data[0].video_position,
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

    try {

      if( empty(req.body.youtubeLink) || empty(req.body.title) )
        return res.status(500).json({statusCode:500,message: "Please check your parameter or value required"}); 

      var youtubeLink = req.body.youtubeLink;
      var title = req.body.title;
      var desc = req.body.desc;
      var contentMarketing = (!empty(req.body.contentMarketing)) ? req.body.contentMarketing : '';
      var youtubeId = youtubeLink.split("youtu.be/")[1];
      var youtubeIframe = "https://youtube.com/embed/"+youtubeId;
      var youtubeImg = "https://i.ytimg.com/vi/"+youtubeId+"/hqdefault.jpg";
      var type = req.body.type;
      var position = (req.body.position == undefined) ? 0 : req.body.position;
      var createdBy = (!empty(req.body.email)) ? req.body.email : "admin";
      var status = (!empty(req.body.email)) ? 0 : 1;

      connection.acquire(function(err,con){
        if (err) throw err;

          var sql = "INSERT INTO videos_admin (video_youtube_id, video_youtube_link, video_youtube_iframe \
          ,video_youtube_image,video_title,video_desc,video_marketing,video_type,video_position,created_by,status,post_date) \
          VALUES ('"+youtubeId+"','"+youtubeLink+"','"+youtubeIframe+"','"+youtubeImg+"','"+title+"', '"+desc+"','"+contentMarketing+"','"+type+"','"+position+"','"+createdBy+"', '"+status+"', NOW())";

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
    } catch (err){
      return res.status(500).json({statusCode:500,message: "Please check your parameter or value required"});
    }
    
     
  };

  this.update = function(req,res,next) {
    try {

      if( empty(req.body.youtubeLink) || empty(req.body.title) || empty(req.body.videoId) )
        return res.status(500).json({statusCode:500,message: "Please check your parameter or value required"}); 
      
      var videoId = req.body.videoId;
      var youtubeLink = req.body.youtubeLink;
      var title = req.body.title;
      var desc = req.body.desc;
      var contentMarketing = (!empty(req.body.contentMarketing)) ? req.body.contentMarketing : '';
      var youtubeId = youtubeLink.split("youtu.be/")[1];
      var youtubeIframe = "https://youtube.com/embed/"+youtubeId;
      var youtubeImg = "https://i.ytimg.com/vi/"+youtubeId+"/hqdefault.jpg";
      var type = req.body.type;
      var position = (req.body.position == undefined) ? 0 : req.body.position;

      connection.acquire(function(err,con){
        if (err) throw err;

        var sql = "UPDATE videos_admin SET video_youtube_id = '"+youtubeId+"' \
        ,video_youtube_link = '"+youtubeLink+"' \
        ,video_youtube_iframe = '"+youtubeIframe+"',video_youtube_image = '"+youtubeImg+"', video_title = '"+title+"', video_desc = '"+desc+"' \
        ,video_marketing = '"+contentMarketing+"',video_type = '"+type+"',video_position = '"+position+"',update_date = NOW() WHERE video_id = '"+videoId+"'";

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
    } catch (err){
      return res.status(500).json({statusCode:500,message: "Please check your parameter or value required"});
    }
    
  };

  this.publish = function(req,res,next) {
    var videoId = req.body.videoId;

    connection.acquire(function(err,con){
      if (err) throw err;

      var sql = "UPDATE videos_admin SET status = 1 \
      ,update_date = NOW() WHERE video_id = '"+videoId+"'";

      //console.log(sql);

        

      con.query(sql, function(err,data){
        con.release();
        if(err)
            return res.status(500).json({statusCode:500,message: err.code});

        if(data.affectedRows == 0)
          return res.status(500).json({statusCode:500,message: "Failed to publish video. Check your parameter."}); 

        return res.status(200).json({
                                statusCode:200,
                                success:true
                            });
 
      });
    });
  };

  this.delete = function(req,res,next) {
    var videoId = req.body.videoId;

    connection.acquire(function(err,con){
      if (err) throw err;

      var sql = "UPDATE videos_admin SET status = 2 \
      ,update_date = NOW() WHERE video_id = '"+videoId+"'";

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
  };

  //========================================================================//

  this.vlist = function(req,res,next) {

    var page = (req.query.page == undefined) ? 1 : req.query.page;
    var limit = (req.query.limit == undefined) ? 20 : req.query.limit;
    var type = req.query.type;
    var email = req.query.email;
    
  
    var offset = (page - 1) * limit;
    var count = " LIMIT "+offset+","+limit;

    var search = "";

    if(!empty(type)){
      search += " AND video_type = '"+type+"'";
    }

    if(!empty(email)){
      search += " AND created_by = '"+email+"'";
    }

    connection.acquire(function(err,con){
      if (err) throw err;

        var sql = "SELECT * from videos_learning WHERE status = 1 "+search+" ORDER BY video_id DESC "+count
        
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
                //"contentMarketing": data[i].video_marketing,
                "type": data[i].video_type,
                //"position": data[i].video_position,
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
  }

  this.vlistSlider = function(req,res,next) {

    var page = (req.query.page == undefined) ? 1 : req.query.page;
    var limit = (req.query.limit == undefined) ? 3 : req.query.limit;
    
  
    var offset = (page - 1) * limit;
    var count = " LIMIT "+offset+","+limit;

    connection.acquire(function(err,con){
      if (err) throw err;

        var sql = "SELECT * from videos_learning WHERE status = 1 AND video_position <> 0 ORDER BY video_position ASC "+count
        
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
                "contentMarketing": data[i].video_marketing,
                "type": data[i].video_type,
                "position": data[i].video_position,
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
  }

  this.vlistAdmin = function(req,res,next) {

    var page = (req.query.page == undefined) ? 1 : req.query.page;
    var limit = (req.query.limit == undefined) ? 20 : req.query.limit;
    var type = req.query.type;
    
  
    var offset = (page - 1) * limit;
    var count = " LIMIT "+offset+","+limit;

    var search = "";

    if(!empty(type)){
      search += " AND video_type = '"+type+"'";
    }

    connection.acquire(function(err,con){
      if (err) throw err;

        var sql = "SELECT * from videos_learning WHERE status <> 2 "+search+" ORDER BY video_id DESC "+count
        
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
                "contentMarketing": data[i].video_marketing,
                "type": data[i].video_type,
                "position": data[i].video_position,
                "createdBy": data[i].created_by,
                "status": data[i].status,
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
  }

  this.vdetail = function(req,res,next) {

      var videoId = req.params.id;
    
      connection.acquire(function(err,con){
        if (err) throw err;

          var sql = "SELECT * from videos_learning WHERE video_id = '"+videoId+"' LIMIT 1";
          
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
                //"contentMarketing": data[0].video_marketing,
                "type": data[0].video_type,
                //"position": data[0].video_position,
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

  this.vpost = function(req,res,next) {

    try {

      if( empty(req.body.youtubeLink) || empty(req.body.title) )
        return res.status(500).json({statusCode:500,message: "Please check your parameter or value required"});

      var youtubeLink = req.body.youtubeLink;
      var title = req.body.title;
      var desc = req.body.desc;
      var contentMarketing = '';
      var youtubeId = youtubeLink.split("youtu.be/")[1];
      var youtubeIframe = "https://youtube.com/embed/"+youtubeId;
      var youtubeImg = "https://i.ytimg.com/vi/"+youtubeId+"/hqdefault.jpg";
      var type = req.body.type;
      var position = 0;
      var createdBy = (!empty(req.body.email)) ? req.body.email : "admin";
      var status = (!empty(req.body.email)) ? 0 : 1;

      connection.acquire(function(err,con){
        if (err) throw err;

          var sql = "INSERT INTO videos_learning (video_youtube_id, video_youtube_link, video_youtube_iframe \
          ,video_youtube_image,video_title,video_desc,video_marketing,video_type,video_position,created_by,status,post_date) \
          VALUES ('"+youtubeId+"','"+youtubeLink+"','"+youtubeIframe+"','"+youtubeImg+"','"+title+"', '"+desc+"','"+contentMarketing+"','"+type+"','"+position+"','"+createdBy+"', '"+status+"', NOW())";

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
    } catch (err){
      return res.status(500).json({statusCode:500,message: "Please check your parameter or value required"});
    }
    
     
  };

  this.vupdate = function(req,res,next) {
    try {

      if( empty(req.body.youtubeLink) || empty(req.body.title) || empty(req.body.videoId) )
        return res.status(500).json({statusCode:500,message: "Please check your parameter or value required"});

      var videoId = req.body.videoId;
      var youtubeLink = req.body.youtubeLink;
      var title = req.body.title;
      var desc = req.body.desc;
      var contentMarketing = (!empty(req.body.contentMarketing)) ? req.body.contentMarketing : '';
      var youtubeId = youtubeLink.split("youtu.be/")[1];
      var youtubeIframe = "https://youtube.com/embed/"+youtubeId;
      var youtubeImg = "https://i.ytimg.com/vi/"+youtubeId+"/hqdefault.jpg";
      var type = req.body.type;
      var position = 0;

      connection.acquire(function(err,con){
        if (err) throw err;

        var sql = "UPDATE videos_learning SET video_youtube_id = '"+youtubeId+"' \
        ,video_youtube_link = '"+youtubeLink+"' \
        ,video_youtube_iframe = '"+youtubeIframe+"',video_youtube_image = '"+youtubeImg+"', video_title = '"+title+"', video_desc = '"+desc+"' \
        ,video_marketing = '"+contentMarketing+"',video_type = '"+type+"',video_position = '"+position+"',update_date = NOW() WHERE video_id = '"+videoId+"'";

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
    } catch (err){
      return res.status(500).json({statusCode:500,message: "Please check your parameter or value required"});
    }
    
  };

  this.vpublish = function(req,res,next) {
    var videoId = req.body.videoId;

    connection.acquire(function(err,con){
      if (err) throw err;

      var sql = "UPDATE videos_learning SET status = 1 \
      ,update_date = NOW() WHERE video_id = '"+videoId+"'";

      //console.log(sql);

        

      con.query(sql, function(err,data){
        con.release();
        if(err)
            return res.status(500).json({statusCode:500,message: err.code});

        if(data.affectedRows == 0)
          return res.status(500).json({statusCode:500,message: "Failed to publish video. Check your parameter."}); 

        return res.status(200).json({
                                statusCode:200,
                                success:true
                            });
 
      });
    });
  };

  this.vdelete = function(req,res,next) {
    var videoId = req.body.videoId;

    connection.acquire(function(err,con){
      if (err) throw err;

      var sql = "UPDATE videos_learning SET status = 2 \
      ,update_date = NOW() WHERE video_id = '"+videoId+"'";

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
  };

}
module.exports = new cVideoAdmin();