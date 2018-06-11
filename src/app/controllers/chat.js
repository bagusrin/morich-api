var connection = require('../../../config/db');

var empty = require('is-empty'),
    cfg = require('../../../config');
 
function cChat() {
 
  this.list = function(req,res,next) {

    var email = req.query.email;
    var page = (req.query.page == undefined) ? 1 : req.query.page;
    var limit = (req.query.limit == undefined) ? 20 : req.query.limit;

    if(empty(email))
      return res.status(500).json({statusCode:500,message: "Parameter email is required"});
    
    
    var offset = (page - 1) * limit;
    var count = " LIMIT "+offset+","+limit;

    

    connection.acquire(function(err,con){
      if (err) throw err;

        var sql = "SELECT   distinct c.ConversationID, \
                            c.UserID_One, \
                            m1.user_id as uidOne, m1.user_firstname as UserOneFirstname, m1.user_lastname as UserOneLastname, \
                            m1.user_photo As UserOneImage, \
                            c.UserID_Two, m2.user_firstname as UserTwoFirstname, m2.user_lastname as UserTwoLastname, \
                            m2.user_id as uidTwo, m2.user_photo As UserTwoImage, \
                            (SELECT count(*) from replies where status = 1 AND UserID <> '"+email+"' AND ConversationID = c.ConversationID) AS NewMessage, \
                            (SELECT Reply FROM replies WHERE ConversationID = c.ConversationID ORDER BY TransactTime DESC LIMIT 1) As LastMessage, \
                            (SELECT UserID FROM replies WHERE UserID <> '"+email+"' AND ConversationID = c.ConversationID ORDER BY TransactTime DESC LIMIT 1) As UserID, \
                            (SELECT TransactTime FROM replies WHERE ConversationID = c.ConversationID ORDER BY TransactTime DESC LIMIT 1) As ReplyTransactTime, \
                            (SELECT Status FROM replies WHERE ConversationID = c.ConversationID ORDER BY TransactTime DESC LIMIT 1) As ReplyStatus \
                  FROM Conversations c \
                  inner join users m1 on m1.user_email = c.UserID_One \
                  inner join users m2 on m2.user_email = c.UserID_Two \
                  where (c.UserID_One = '"+email+"' and c.UserOneStatus <= 4) or (c.UserID_Two = '"+email+"' and c.UserTwoStatus <= 4) \
                  ORDER BY ReplyTransactTime DESC "+count;
        
        con.query(sql, function(err,data){
          con.release();
          if(err)
              return res.status(500).json({statusCode:500,message: err.code});
             
          var dt = [];
          for (var i = 0; i < data.length; i++) {

              var userId = "";
              var firstName = "";
              var lastName = "";
              var email_ = "";

              //console.log(data[i].UserOneFirstname);

              if(data[i].UserID_One == email){
                userId = data[i].uidTwo;
                email_ = data[i].UserID_Two;
                firstName = data[i].UserTwoFirstname;
                lastName = data[i].UserTwoLastname;
                pp = (data[i].UserTwoImage) ? cfg.photoProfileUrl+''+data[i].UserTwoImage : null;

                var fullName = data[i].UserTwoFirstname+' '+data[0].UserTwoLastname;

                var splitName = fullName.trim().split(" ");

                if(splitName.length > 1){
                  var initialName = splitName[0].charAt(0)+''+splitName[1].charAt(0);
                }else{
                  var initialName = splitName[0].charAt(0);
                }

              }else{
                userId = data[i].uidOne;
                email_ = data[i].UserID_One;
                firstName = data[i].UserOneFirstname;
                lastName = data[i].UserOneLastname;
                pp = (data[i].UserOneImage) ? cfg.photoProfileUrl+''+data[i].UserOneImage : null;

                var fullName = data[i].UserOneFirstname+' '+data[0].UserOneLastname;

                var splitName = fullName.trim().split(" ");

                if(splitName.length > 1){
                  var initialName = splitName[0].charAt(0)+''+splitName[1].charAt(0);
                }else{
                  var initialName = splitName[0].charAt(0);
                } 
              }

              dt.push({
                "conversationId": data[i].ConversationID,
                "userId": userId,
                "email": email_,
                "firstName": firstName,
                "lastName": lastName,
                "photoURL": pp,
                "initialName": initialName,
                "newMessage": data[i].NewMessage,
                "lastMessage": data[i].LastMessage,
                "replyTransactTime": data[i].ReplyTransactTime,
                "replyStatus": data[i].ReplyStatus
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

    var conversationId = req.query.conversationId;
    var requestBy = req.query.requestBy;
    var receiver = req.query.receiver;
    var page = (req.query.page == undefined) ? 1 : req.query.page;
    var limit = (req.query.limit == undefined) ? 20 : req.query.limit;

    if(empty(conversationId))
      return res.status(500).json({statusCode:500,message: "Parameter conversationId is required"});

    if(empty(requestBy))
      return res.status(500).json({statusCode:500,message: "Parameter requestBy is required"});

    if(empty(receiver))
      return res.status(500).json({statusCode:500,message: "Parameter receiver is required"});
    
    
    var offset = (page - 1) * limit;
    var count = " LIMIT "+offset+","+limit;

    

    connection.acquire(function(err,con){
      if (err) throw err;

        var sql = "SELECT   r.*,  \
                            m1.user_firstname as senderFirstname, m1.user_lastname as senderLastname, \
                            m1.user_photo As senderPhoto, \
                            m2.user_firstname as receiverFirstname, m2.user_lastname as receiverLastname, \
                            m2.user_photo As receiverPhoto \
                  FROM replies r \
                  inner join users m1 on m1.user_email = r.UserID \
                  inner join users m2 on m2.user_email = r.UserRecepient \
                  where ConversationID = '"+conversationId+"' \
                  ORDER BY TransactTime DESC "+count;
        
        con.query(sql, function(err,data){
          con.release();
          if(err)
              return res.status(500).json({statusCode:500,message: err.code});
             
          //console.log(data);
          var dt = [];
          for (var i = 0; i < data.length; i++) {

              var ppSender = (data[i].senderPhoto) ? cfg.photoProfileUrl+''+data[i].senderPhoto : null;

              var fullNameSender = data[i].senderFirstname+' '+data[i].senderLastname;

              var splitNameSender = fullNameSender.trim().split(" ");

              if(splitNameSender.length > 1){
                var initialNameSender = splitNameSender[0].charAt(0)+''+splitNameSender[1].charAt(0);
              }else{
                var initialNameSender = splitNameSender[0].charAt(0);
              } 


              var ppReceiver = (data[i].receiverPhoto) ? cfg.photoProfileUrl+''+data[i].receiverPhoto : null;

              var fullNameReceiver = data[i].receiverFirstname+' '+data[0].receiverLastname;

              var splitNameReceiver = fullNameReceiver.trim().split(" ");

              if(splitNameReceiver.length > 1){
                var initialNameReceiver = splitNameReceiver[0].charAt(0)+''+splitNameReceiver[1].charAt(0);
              }else{
                var initialNameReceiver = splitNameReceiver[0].charAt(0);
              }

              if(data[i].UserID == requestBy){ 

                dt.push({
                  "replyId": data[i].ReplyID,
                  "conversationId": data[i].ConversationID,
                  "message": data[i].Reply,
                  "senderEmail": data[i].UserID,
                  "senderFirstname": data[i].senderFirstname,
                  "senderLastname": data[i].senderLastname,
                  "photoURLSender": ppSender,
                  "initialNameSender": initialNameSender,
                  "receiverEmail": data[i].receiver,
                  "receiverFirstname": data[i].receiverFirstname,
                  "receiverLastname": data[i].receiverLastname,
                  "photoURLReceiver": ppReceiver,
                  "initialNameReceiver": initialNameReceiver,
                  "transactTime": data[i].TransactTime,
                  "replyStatus": data[i].Status,
                  "from": data[i].UserID,
                  "to": receiver
                });
              
              }else{

                dt.push({
                  "replyId": data[i].ReplyID,
                  "conversationId": data[i].ConversationID,
                  "message": data[i].Reply,
                  "senderEmail": data[i].UserID,
                  "senderFirstname": data[i].senderFirstname,
                  "senderLastname": data[i].senderLastname,
                  "photoURLSender": ppSender,
                  "initialNameSender": initialNameSender,
                  "receiverEmail": data[i].receiver,
                  "receiverFirstname": data[i].receiverFirstname,
                  "receiverLastname": data[i].receiverLastname,
                  "photoURLReceiver": ppReceiver,
                  "initialNameReceiver": initialNameReceiver,
                  "transactTime": data[i].TransactTime,
                  "replyStatus": data[i].Status,
                  "from": data[i].UserID,
                  "to": requestBy
                });
              }
          }

          return res.status(200).json({
                                  statusCode:200,
                                  success:true,
                                  data:dt
                              });
 
      });
    });
  }

  this.send = function(req,res,next) {

    connection.acquire(function(err,con){
      if (err) throw err;

        var sql = "INSERT INTO replies (Reply, UserID, UserRecepient, Status, \
            ConversationID,TransactTime) \
            VALUES ('"+req.body.message+"','"+req.body.sender+"','"+req.body.receiver+"',1,'"+req.body.conversationId+"', NOW())";
        
        //console.log(sql);
        con.query(sql, function(err,data){
          con.release();
          if(err)
              return res.status(500).json({statusCode:500,message: err.code});
             
          
          con.query("SELECT TransactTime FROM replies WHERE ReplyID = "+data.insertId+" LIMIT 1", function(err,data2){
            return res.status(200).json({
                                  statusCode:200,
                                  success:true,
                                  data:{"replyId":data.insertId,"transactTime":data2[0].TransactTime}
                              });
            });
        });

    });
  }

  this.getUserInfo = function(req,res,next) {
     connection.acquire(function(err,con){
        if (err) throw err;

          var sql = 'SELECT * FROM users WHERE user_email="'+req.query.email+'" LIMIT 1';
          //console.log(sql);
          con.query(sql, function(err,data){
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

              initialName = initialName.toUpperCase();

              dt.push({
                "userId": data[0].user_id,
                "email": data[0].user_email,
                "firstName": data[0].user_firstname,
                "lastName": data[0].user_lastname,
                "initialName": initialName,
                "photoUrl": pp
              });

              //console.log(dt[0]);

              return res.status(200).json({statusCode:200,success:true,data:dt[0]});
            }
        });
     });
  };

  

}
module.exports = new cChat();