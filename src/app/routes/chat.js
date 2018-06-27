var chat = require('../controllers/chat');
 
module.exports = {
  configure: function(app) {
    app.route('/chat/list').get(chat.list);
    app.route('/chat/detail').get(chat.detail);
    app.route('/chat/send').post(chat.send);
    app.route('/chat/user-info').get(chat.getUserInfo);
    app.route('/chat/conversation/id').get(chat.getConversationId);
    app.route('/chat/list/search').get(chat.listSearch);
  }
};