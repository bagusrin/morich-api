var connection = require('../../../config/db');
 
function cGeneral() {
  this.countryList = function(req,res,next) {
    connection.acquire(function(err,con){
      if (err) throw err;
        var sql = 'SELECT * FROM countries';
        con.query(sql, function(err,data){
          con.release();
          if(err)
              return res.status(500).json({statusCode:500,message: err.code});
             

          var dt = [];
          for (var i = 0; i < data.length; i++) {
              dt.push({
                "countryId": data[i].country_id,
                "code": data[i].country_code,
                "name": data[i].country_name
              });
          } 

          return res.status(200).json({statusCode:200,success:true,data:dt});
 
      });
    });
  };

  this.languageList = function(req,res,next) {
    connection.acquire(function(err,con){
      if (err) throw err;
        var sql = 'SELECT * FROM languages';
        con.query(sql, function(err,data){
          con.release();
          if(err)
              return res.status(500).json({statusCode:500,message: err.code});
             

          var dt = [];
          for (var i = 0; i < data.length; i++) {
              dt.push({
                "languageId": data[i].language_id,
                "code": data[i].language_code,
                "name": data[i].language_name
              });
          } 

          return res.status(200).json({statusCode:200,success:true,data:dt});
 
      });
    });
  };

  
}
module.exports = new cGeneral();