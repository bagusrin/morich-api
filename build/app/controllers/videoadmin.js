var connection = require('../../../config/db');

var jwt = require('jsonwebtoken'),
    bcrypt = require('bcrypt'),
    userModel = require('../models/user'),
    empty = require('is-empty');

function cVideoAdmin() {

  this.list = function (req, res, next) {

    var page = req.query.page == undefined ? 1 : req.query.page;
    var limit = req.query.limit == undefined ? 20 : req.query.limit;
    var type = req.query.type;

    var offset = (page - 1) * limit;
    var count = " LIMIT " + offset + "," + limit;

    var search = "";

    if (!empty(type)) {
      search += " AND video_type = '" + type + "'";
    }

    connection.acquire(function (err, con) {
      if (err) throw err;

      var sql = "SELECT * from videos_admin WHERE status = 1 " + search + " ORDER BY video_id DESC " + count;

      con.query(sql, function (err, data) {
        con.release();
        if (err) return res.status(500).json({ statusCode: 500, message: err.code });

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
            "type": data[i].video_type,
            "position": data[i].video_position,
            "postDate": data[i].post_date
          });
        }

        return res.status(200).json({
          statusCode: 200,
          success: true,
          data: dt
        });
      });
    });
  };

  this.detail = function (req, res, next) {

    var videoId = req.params.id;

    connection.acquire(function (err, con) {
      if (err) throw err;

      var sql = "SELECT * from videos_admin WHERE status = 1 AND video_id = '" + videoId + "' LIMIT 1";

      con.query(sql, function (err, data) {
        con.release();
        if (err) return res.status(500).json({ statusCode: 500, message: err.code });

        if (data.length < 1) {
          res.status(404).json({ statusCode: 404, message: "Data not found" });
        } else {
          var dt = [];
          dt.push({
            "videoId": data[0].video_id,
            "youtubeId": data[0].video_youtube_id,
            "youtubeLink": data[0].video_youtube_link,
            "youtubeIframe": data[0].video_youtube_iframe,
            "youtubeImg": data[0].video_youtube_image,
            "title": data[0].video_title,
            "description": data[0].video_desc,
            "type": data[0].video_type,
            "position": data[0].video_position,
            "postDate": data[0].post_date
          });

          return res.status(200).json({
            statusCode: 200,
            success: true,
            data: dt[0]
          });
        }
      });
    });
  };

  this.post = function (req, res, next) {

    try {
      var youtubeLink = req.body.youtubeLink;
      var title = req.body.title;
      var desc = req.body.desc;
      var youtubeId = youtubeLink.split("v=")[1];
      var youtubeIframe = "https://youtube.com/embed/" + youtubeId;
      var youtubeImg = "https://i.ytimg.com/vi/" + youtubeId + "/maxresdefault.jpg";
      var type = req.body.type;
      var position = req.body.position == undefined ? 0 : req.body.position;
      var status = 1;

      connection.acquire(function (err, con) {
        if (err) throw err;

        var sql = "INSERT INTO videos_admin (video_youtube_id, video_youtube_link, video_youtube_iframe \
          ,video_youtube_image,video_title,video_desc,video_type,video_position,status,post_date) \
          VALUES ('" + youtubeId + "','" + youtubeLink + "','" + youtubeIframe + "','" + youtubeImg + "','" + title + "', '" + desc + "','" + type + "','" + position + "', '" + status + "', NOW())";

        console.log(sql);

        con.query(sql, function (err, data) {
          con.release();
          if (err) return res.status(500).json({ statusCode: 500, message: err.code });

          return res.status(200).json({
            statusCode: 200,
            success: true,
            data: { "videoId": data.insertId }
          });
        });
      });
    } catch (err) {
      return res.status(500).json({ statusCode: 500, message: "Please check your parameter or value required" });
    }
  };

  this.update = function (req, res, next) {
    try {
      var videoId = req.body.videoId;
      var youtubeLink = req.body.youtubeLink;
      var title = req.body.title;
      var desc = req.body.desc;
      var youtubeId = youtubeLink.split("v=")[1];
      var youtubeIframe = "https://youtube.com/embed/" + youtubeId;
      var youtubeImg = "https://i.ytimg.com/vi/" + youtubeId + "/maxresdefault.jpg";
      var type = req.body.type;
      var position = req.body.position == undefined ? 0 : req.body.position;
      var status = 1;

      connection.acquire(function (err, con) {
        if (err) throw err;

        var sql = "UPDATE videos_admin SET video_youtube_id = '" + youtubeId + "' \
        ,video_youtube_link = '" + youtubeLink + "' \
        ,video_youtube_iframe = '" + youtubeIframe + "',video_youtube_image = '" + youtubeImg + "', video_title = '" + title + "', video_desc = '" + desc + "' \
        ,video_type = '" + type + "',video_position = '" + position + "',update_date = NOW() WHERE video_id = '" + videoId + "'";

        con.query(sql, function (err, data) {
          con.release();
          if (err) return res.status(500).json({ statusCode: 500, message: err.code });

          return res.status(200).json({
            statusCode: 200,
            success: true,
            data: { "videoId": videoId }
          });
        });
      });
    } catch (err) {
      return res.status(500).json({ statusCode: 500, message: "Please check your parameter or value required" });
    }
  };

  this.delete = function (req, res, next) {
    var videoId = req.body.videoId;

    connection.acquire(function (err, con) {
      if (err) throw err;

      var sql = "UPDATE videos_admin SET status = 0 \
      ,update_date = NOW() WHERE video_id = '" + videoId + "'";

      //console.log(sql);


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
module.exports = new cVideoAdmin();
//# sourceMappingURL=videoadmin.js.map