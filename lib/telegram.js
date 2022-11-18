const TelegramBot = require('node-telegram-bot-api');
const config = require('../config');

class TelegramAPI {
  sendMessage (data) {
    let bot = new TelegramBot(config.token);

    bot.sendMessage(config.chat_id, data, {parse_mode : 'HTML'});
  }
}

module.exports = TelegramAPI;