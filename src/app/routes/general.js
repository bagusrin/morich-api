var general = require('../controllers/general');
 
module.exports = {
  configure: function(app) {
  	app.route('/language/list').get(general.languageList);
    app.route('/country/list').get(general.countryList);
    app.route('/apps/config').get(general.appsVersion);
  }
};