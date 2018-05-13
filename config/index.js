const path = require('path');
const cfg = require('../common/config');

const def = {};

// setup default env
def.env = process.env.NODE_ENV || 'development';
process.env.NODE_ENV = def.env;

def.debug = true;
def.https = false;
def.host = 'localhost';
def.port = 4100;

// paths
const rootDir = path.dirname(__dirname);
def.publicPath = path.join(rootDir, 'public');
def.cachePath = path.join(rootDir, 'cache');
def.tempPath = path.join(rootDir, 'temp');

//Base Url
def.base_url = '';
def.api_url = process.env.API_URL || '';
def.photoProfileUrl = process.env.PP_URL || '';

//sendgrid
def.apikey_sendgrid = process.env.APIKEY_SENDGRID || 'apikey';

//Database
def.dbhost = process.env.DB_HOST || '';
def.dbuser = process.env.DB_USER || '';
def.dbpassword = process.env.DB_PASSWORD || '';
def.db = process.env.DB || '';

cfg.resolveLocalConfig(__dirname, (err, file) => {
  // eslint-disable-next-line global-require, import/no-dynamic-require
  if (!err) cfg.merge(def, require(file));
});

module.exports = def;