const WebHook = require('./controllers/webhooks.js');

exports.handler = (event, context, callback) => {
  let webhook = new WebHook();

  webhook.post(event, (err, data) => {
    if (err) {
      console.log(err);
      return callback(err.message)
    }

    callback(null, data);
  });
};