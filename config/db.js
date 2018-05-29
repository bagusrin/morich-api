var cfg = require('../config'),
    mysql = require('mysql'),
    util = require('util');

function Connection() {
 
  this.pool = null;
 
  var konek = {
    connectionLimit: 1000000,
    host     : cfg.dbhost,
    user     : cfg.dbuser,
    password : cfg.dbpassword,
    database : cfg.db
  };
 
  this.init = function() {
    this.pool = mysql.createPool(konek);
  }
 
  this.acquire = function(callback) {
    this.pool.getConnection(function(err, connection) {
      callback(err, connection);
    });
  };
}

module.exports = new Connection();